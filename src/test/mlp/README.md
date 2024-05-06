# mlp

lightweight ML inference server with sockets


## Installation 

Run the following commands to set up your environment.

```sh
conda create -n mlp_server python=3.11
conda activate mlp_server
pip install -r requirements.txt
```
## Getting Started

For running the server and client together run the following command:

```sh
# open up 2 terminals and run the client command in one and the server in another
conda activate mlp_server
make server

conda activate mlp_server
make client
```

### Running unittests

For running unittests run the following command:

```sh
make test

# basically runs the following command under the hood
pytest
```
