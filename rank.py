#!/usr/bin/env python3
import sys
import subprocess
import os

def main():
    # Make sure we use the compiled JS ranker
    script_path = os.path.join("backend", "dist", "services", "cie", "rank.js")
    
    # Check if compiled file exists, otherwise build it
    if not os.path.exists(script_path):
        print("Compiling TypeScript services...")
        subprocess.run(["npm", "run", "build"], cwd="backend", check=True)
        
    cmd = ["node", script_path] + sys.argv[1:]
    res = subprocess.run(cmd)
    sys.exit(res.returncode)

if __name__ == "__main__":
    main()
