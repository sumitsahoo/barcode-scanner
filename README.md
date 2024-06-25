## ℹ️ Barcode Scanner with ZBar WASM

This project is a barcode scanner application built with React and ZBar WASM. It uses the device's camera to scan barcodes and display the decoded information.

## 👨🏻‍💻 Live App

You can try the live version on GitHub pages here: https://sumitsahoo.github.io/barcode-scanner

## 📷 Screenshots

### App running on iPhone

![iPhone](public/screenshots/screenshot-1290x2796.png "App running on iPhone 15 Pro")

### App running on iPad

![iPad](public/screenshots/screenshot-2732x2048.png "App running on iPad Pro")

## 📖 Features

1. Real-time barcode scanning
2. Start and stop scanning functionality
3. Switch between front and back camera in phones and tablets
4. Toggle flash for night time scanning
5. Display of scanning results in a dialog box with copy option

## 📦 Local Installation

Clone the repository:

```bash
git clone https://github.com/sumitsahoo/barcode-scanner.git
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

The application will open in your default web browser. Click the "Camera" button icon to begin scanning a barcode. The decoded information will be displayed in a dialog box.

## 🚢 Docker

If you are planning on deploying the app to the cloud, you need a Docker image. To build the same use the `Dockerfile` provided. The multi-stage build makes sure the resulting image is smaller in size and only includes the libraries that are needed. Also, the use of non-root user makes it more secure.<br>

Build arm64 (Apple Silicon & ARM) image (Make sure cloud deployment supports arm64 images):

```bash
docker build --no-cache -t barcode-scanner .
```

For amd64 (Intel & AMD) image (most common and widely supported):

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
3. <a href="https://pixabay.com/sound-effects/search/beep/" title="beep sound">Beep sound from Pixabay</a>


## 📜 License

MIT License

Copyright © 2024 Sumit Sahoo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
