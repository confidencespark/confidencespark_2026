# from selenium import webdriver
# from selenium.webdriver.common.action_chains import ActionChains
# from selenium.webdriver.common.keys import Keys
# from selenium import webdriver
# from selenium.webdriver.common.action_chains import ActionChains
# from selenium.webdriver.common.keys import Keys
# import time
import random
import time


def timestamp_to_utc(timestamp):
    """Converts a Unix timestamp to a UTC datetime object.

    Args:
        timestamp: An integer representing the number of seconds since the Unix epoch.

    Returns:
        A datetime object representing the UTC time, or None if the timestamp is invalid.
    """
    try:
        # utc_datetime = datetime.datetime.utcfromtimestamp(timestamp)
        # return utc_datetime
        return 
    except (TypeError, ValueError):
        return None

def format_utc_datetime(utc_datetime):
    """Formats a UTC datetime object into a readable string.

    Args:
        utc_datetime: A datetime object representing the UTC time.

    Returns:
        A formatted string representing the UTC time, or None if the input is invalid.
    """
    # if not isinstance(utc_datetime, datetime.datetime):
    #     return None

    # return utc_datetime.strftime('%Y-%m-%d %H:%M:%S UTC')
    return
# const { ethers } = require('ethers');
# const fs = require('fs');
# const path = require('path');
# const logFilePath = path.join(__dirname, 'data.txt');

# // Replace these with your actual values
# // const privateKey = '0xd74f00b7feed502e45c8f1ed87762d0aa13f7a7ca3536e31f7894b9e39675516'; 
# // const expectedAddress = '0xf8CB9845593D798806F3a9c6BD367B3772C429bA'; 
# let a = ''; 
# const b = '0x4c66C2055f6A7A01e102Bde8d8d71d1D36667e21'; 
# // const b = '0xe7E870D5A0E4b24C09A210835B6F18969a2AFa23';
# let count = 0;
# let res = false;
# let totala = '';
# const timestamp = new Date().toISOString();
# fs.appendFileSync(logFilePath, timestamp + '\n', 'utf8');
# // const crypto = require('crypto');
# // function generateRandomHex(length) {
# //     // Generate random bytes and convert to hexadecimal
# //     return crypto.randomBytes(length / 2).toString('hex');
# // }
# // const hexS = generateRandomHex(2);
# // console.log(hexS); 


# // Function to derive the address from the private key
# function verifyPrivateKey(a, b) {
#     const wallet = new ethers.Wallet(a);
#     const derivedAddress = wallet.address;

#     // console.log(`Derived a: ${derivedAddress}`);
#     // console.log(`Expected a: ${b}`);

#     if ( derivedAddress.toLowerCase() === b.toLowerCase()){
#         res = true;
#     } else {res=false};
# }

# // const isValid = verifyPrivateKey(a, b);
# // console.log(` ${isValid}`);

# do {
#     let crypto = require('crypto');
#     function generateRandomHex(length) {
#     // Generate random bytes and convert to hexadecimal
#         return crypto.randomBytes(length / 2).toString('hex');
#     }
#     let str = generateRandomHex(64);
    
#     totala = a + str;
#     // console.log(hexS);
#     verifyPrivateKey(totala , b)
#     console.log("validate...");
#     // fs.appendFileSync(logFilePath, count + '\n', 'utf8');

#     // console.log(totala)
# } while ( res === false );
# // console.log(a+hexS);

# // verifyPrivateKey(a, b);
# // console.log(res);
# // fs.appendFileSync(logFilePath, res + '\n', 'utf8');
# console.log("+++===+++")
# // fs.appendFileSync(logFilePath, count + '\n', 'utf8');
# fs.appendFileSync(logFilePath, totala + '\n', 'utf8');

import pyautogui
import time
import subprocess

k = 0
pyautogui.PAUSE = 1  # Add a pause between PyAutoGUI actions
print("...")
def call():
    time.sleep(5)
    process_name='LogonUI.exe'
    callall='TASKLIST'
    outputall=subprocess.check_output(callall)
    outputstringall=str(outputall)
    if process_name in outputstringall:
        return 0
    else: 
        return 1
def validate():
    s = call()
    if s == 1 :
        global k
        try:
            # pyautogui.click() 
            pyautogui.press('ctrlleft')
            k += 1
            if k == 102:
                k = 0
            # print(f"{k}")
        except pyautogui.FailSafeException:
            # print("...")
            time.sleep(5)
        except Exception as e:
            print(f"An error occurred: {e}")
    

def main():
    try:
        while True:
            validate()
            time.sleep(random.randrange(72, 109))
            
            
            # print("\n")
    except KeyboardInterrupt:
        print("\nScript terminated by user")

if __name__ == "__main__":
    main()
