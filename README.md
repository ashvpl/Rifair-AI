Dataset Setup

The official Redrob AI Hackathon dataset is intentionally excluded from source control due to GitHub file size limitations.

Place the following files inside:

datasets/

Required:

* candidates.jsonl

Optional:

* sample_candidates.json

Example:

datasets/
├── candidates.jsonl
├── sample_candidates.json

The ranking engine will automatically load the dataset from this directory.
