#!/bin/sh

# Run the initial build to cache any configuration changes
yarn build >/dev/null

# Execute the build procedure multiple times
for i in $(seq 1 10); do
	echo "Build #${i}"
	
	echo -e "\tRunning pre-build"
	yarn build >/dev/null
	
	echo -e "\tModifying files"
	sed -i. "s/{\/\*BEGINBUILDUPDATECODE//g" ./src/components/Drawer.js
	sed -i. "s/{\/\*ENDBUILDUPDATECODE//g" ./src/components/Drawer.js

	echo -e "\tRunning build"
	yarn build

	echo -e "\tResetting files"
	git reset head --hard ./src
done
