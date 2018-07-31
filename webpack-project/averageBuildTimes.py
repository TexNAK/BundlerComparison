total=0
count=0
with open("buildTimes.txt") as f:
    for line in f:
        count += 1
        total += float(line)

print(total/count)
