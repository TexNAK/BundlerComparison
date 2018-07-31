#!/usr/bin/env python3
import os
import sys
import csv
import psutil
import multiprocessing
import subprocess
import numpy
from time import sleep, time
from scipy.interpolate import interp1d

def runBuild():
    # Execute the build
    d = subprocess.Popen(['yarn', 'build'], stdout=subprocess.PIPE)

    buildInformation = []
    webpackPID = None
    while d.poll() is None:
        # Don't use too much CPU
        sleep(0.25)

        # Access the build process
        try:
            parent = psutil.Process(d.pid)
        except psutil.NoSuchProcess:
            exit(1)

        # Iterate all the children (since it executes yarn which spawns webpack as a child)
        children = parent.children(recursive=True)
        for process in children:
            # Check if it is webpack
            if not "webpack" in process.cmdline()[1]:
                continue

            # Save the PID for later comparison and check for changes
            if webpackPID is None:
                webpackPID = process.pid
            elif not webpackPID == process.pid:
                print("ERROR - The PID of webpack apparently changed. This is not supposed to happen")
                exit(1)

            # Store the memory usage information in MiB
            memory = process.memory_info().rss / 1024 / 1024
            times = process.cpu_times()
            timestamp = round(time() - process.create_time(), 4)

            data = {}
            data['memory'] = round(memory, 4)
            data['userTime'] = round(times.user)
            data['systemTime'] = round(times.system)
            data['time'] = timestamp
            buildInformation.append(data)

    # Wait for the build to finish if applicable (shouldn't be necessary due to the while condition but better safe than sorry)
    d.wait()

    # Retrieve the build duration from the output
    output = str(d.stdout.read()).split('\\n')
    duration = float([x for x in output if "General output" in x][0].split(' ')[4])
    
    # Build the output dict
    res = {}
    res['duration'] = duration
    res['details'] = buildInformation
    return res


# Run a initial build to populate any caches
print("Running initial build")
#runBuild()

buildCount = 5
results = []
for i in range(0, buildCount):
    print("Build #" + str(i))
    
    # Execute a build to create a baseline
    print("\tRunning pre-build")
    #runBuild()

    # Modify some files to make for a realistic scenario
    print("\tModifying files")
    subprocess.Popen(["sed", "-i", "", "s/{\/\*BEGINBUILDUPDATECODE//g", "./src/components/Drawer.js"]).wait()
    subprocess.Popen(["sed", "-i", "", "s/ENDBUILDUPDATECODE\*\/}//g", "./src/components/Drawer.js"]).wait()

    # Run a build on the changes
    print("\tRunning build")
    res = runBuild()
    results.append(res)

    # Revert the changes
    print("\tResetting files")
    subprocess.Popen(["git", "checkout", "src/components/Drawer.js"]).wait()

    print()

# Calculate the average build run duration
averageDuration = 0.0
maximumDuration = 0.0
for result in results:
    averageDuration += result['duration']
    if result['duration'] > maximumDuration:
        maximumDuration = result['duration']
averageDuration = averageDuration / buildCount

def getAxisData(data, field):
    axis = []
    for dataPoint in data['details']:
        axis.append(dataPoint[field])
    return axis


# Takes a list of interpolated graphs, puts the value of each graph at a given coord in a array and averages them
def mergeGraphs(graphs, xCoordinate, insertCoordinate = True):
    data = []
    # Add the value from each graph
    for graph in graphs:
        value = 0.0
        try:
            value = graph(xCoordinate)
        except Exception:
            pass
        data.append(round(float(value), 4))
    # Append the average
    data.insert(0, round(float(numpy.mean(data)), 4))
    # Insert the coordinate if required
    if insertCoordinate:
        data.insert(0, xCoordinate)
    return data

header = ["Time index", "Average"]
for i in range(1, len(results) + 1):
    header.append("Build " + str(i))

points = numpy.arange(0, maximumDuration, 0.25)
memoryGraphs = []
userTimeGraphs = []
systemTimeGraphs = []
for result in results:
    time = getAxisData(result, 'time')
    memory = getAxisData(result, 'memory')
    userTime = getAxisData(result, 'userTime')
    systemTime = getAxisData(result, 'systemTime')

    memoryGraphs.append(interp1d(time, memory))
    userTimeGraphs.append(interp1d(time, userTime))
    systemTimeGraphs.append(interp1d(time, systemTime))

memoryData = [header]
userTimeData = [header]
systemTimeData = [header]
for x in points:
    memoryData.append(mergeGraphs(memoryGraphs, x))
    userTimeData.append(mergeGraphs(userTimeGraphs, x))
    systemTimeData.append(mergeGraphs(systemTimeGraphs, x))

with open('data/time_user.csv', 'w') as file:
    writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_ALL)
    writer.writerows(userTimeData)
with open('data/time_system.csv', 'w') as file:
    writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_ALL)
    writer.writerows(systemTimeData)
with open('data/memory.csv', 'w') as file:
    writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_ALL)
    writer.writerows(memoryData)

def index_of_last_nonzero(lst):
    for i, value in enumerate(reversed(lst)):
        if value != 0.0:
            return len(lst)-i-1
    return -1

def getLastValues(lst):
    lastValues = []
    for x in range(0, len(lst[0])):
        found = False
        for i, value in enumerate(reversed(lst)):
            if value[x] != 0.0:
                lastValues.append(lst[len(lst)-i-1][x])
                found = True
                break;
        if not found:
            lastValues.append(0.0)
    return lastValues



finalUserTime = getLastValues(userTimeData)[2::]
finalSystemTime = getLastValues(systemTimeData)[2::]
print("User time:\t" + str(finalUserTime))
print("System time:\t" + str(finalSystemTime))
print("Total time:\t" + str(numpy.add(finalSystemTime, finalUserTime)))
