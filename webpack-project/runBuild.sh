#!/bin/sh

# Run the initial build to cache any configuration changes
echo "Initial build"
yarn build >/dev/null

# Execute the build procedure multiple times
for i in $(seq 1 3); do
	echo "Build #${i}"
	
	echo "\tRunning pre-build"
	yarn build >/dev/null
	
	echo "\tModifying files"
	sed -i '' "s/{\/\*BEGINBUILDUPDATECODE//g" ./src/components/Drawer.js
	sed -i '' "s/ENDBUILDUPDATECODE\*\/}//g" ./src/components/Drawer.js

	echo "\tRunning build"
	yarn build

	# echo "\tResetting files"
	# git reset head --hard ./src
done
