#!/bin/bash

# This is testing the local API, make sure to run the API before running these test cases

echo "~~~~~~~~~~~~~~API BlackBox Testing~~~~~~~~~~~~~~~~~~~~~"
python3 api_blackbox_tests.py

echo "~~~~~~~~~~~~~~~API WhiteBox/Unit Testing~~~~~~~~~~~~~~~"
sh api_unit_tests.sh


