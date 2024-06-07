## ℹ️ Barcode Scanner with ZBar WASM

This project is a barcode scanner application built with React and ZBar WASM. It uses the device's camera to scan barcodes and display the decoded information.

## 📖 Features

Real-time barcode scanning
Start and stop scanning functionality
Display of scanning results in a dialog box

## 📦 Installation

Clone the repository:

```bash
git clone
```

Install the dependencies:

```bash
npm install
```

## 📖 Usage

Start the application:

```bash
npm run dev
```

The application will open in your default web browser. Click the "Start Scan" button to begin scanning a barcode. The decoded information will be displayed in a dialog box.

🚢 Docker

If you are planning on deploying the app to the cloud, you need a Docker image. To build the same use the `Dockerfile` provided. The multi-stage build makes sure the resulting image is smaller in size and only includes the libraries that are needed. Also, the use of non-root user makes it more secure.<br>

Build arm64 image (Make sure cloud deployment supports arm64 images):

```bash
docker build --no-cache -t barcode-scanner .
```

For amd64 image (most common and widely supported):

```bash
docker buildx build --no-cache --platform linux/amd64 -t barcode-scanner .
```

Once the image is built, you can push the same to any cloud provider and use a serverless service to deploy the same easily.

To run the Docker image locally use the below command:

```bash
docker run -it \
-p 8080:8080 \
--name barcode-scanner \
barcode-scanner
```

## 💼 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 🙏🏻 Attributions

1. <a href="https://github.com/undecaf/zbar-wasm" title="zbar wasm">ZBar WASM library for barcode detection</a><br>
2. <a href="https://www.svgrepo.com/" title="svg icons">Icons from SVG Repo</a>

## 📜 License

MIT License

Copyright (c) 2024 Sumit Sahoo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
