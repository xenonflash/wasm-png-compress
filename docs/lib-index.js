const worker = new Worker(require('./lib-worker.js'));
worker.onmessage = e => {
    switch (e.data.type) {
        case 'log':
            log(e.data.msg);
            break;
        case 'logError':
            logError(e.data.msg);
            break;
        case 'result':
            showResult(e.data.result);
            break;
        case 'error':
            showErrorResult(e.data.error);
            break;
    }
};

let currentTask = {};

let logStart;

function initLog() {
    logStart = performance.now();
}

function log(msg) {
    let logTime = Math.round(performance.now() - logStart).toString();
    while (logTime.length < 5) {
        logTime = ' ' + logTime;
    }
    console.log(`[${logTime}ms] ${msg}\n`)
}

function logError(msg) {
    log('ERROR ' + msg);
}

const defaultOptions = {
    maxColors: 256,
    dithering: 0.5,
}
export function processFile(file, options = defaultOptions) {
    currentTask = { fileName: file.name };
    if (file.type != 'image/png') {
        log('invalid image type')
        return;
    }
    log('Loading file data');
    const reader = new FileReader();
    reader.onload = e => {
        const result = e.target.result;
        const fileName = file.name;
        const fileSize = result.byteLength;
        log(`File data loaded: ${fileName}, ${fileSize} bytes`);
        processImage(result, options);
    };
    reader.onerror = () => {
        log('fail to load')
    };
    reader.readAsArrayBuffer(file);
}

function processImage(data, options) {
    const fileSize = data.byteLength;
    appendImageToImages(data, 'img-original').then(imageEl => {
        const width = imageEl.origWidth;
        const height = imageEl.origHeight;
        log(`Image decoded: ${width}x${height}`);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(imageEl, 0, 0);
        const rgbData = context.getImageData(0, 0, width, height).data;
        log(`Converted to RGB data: ${rgbData.byteLength} bytes`);
        currentTask.width = width;
        currentTask.height = height;
        currentTask.rgbData = rgbData;
        currentTask.fileSize = fileSize;
        currentTask.options = options;
        postImageTask();
    }).catch(e => {
        logError(e);
    });
}

function postImageTask() {
    currentTask.inProgress = true;
    worker.postMessage({
        type: 'image',
        rgbData: currentTask.rgbData,
        width: currentTask.width,
        height: currentTask.height,
        fileSize: currentTask.fileSize,
        options: currentTask.options
    });
}

function showResult(result) {
    appendImageToImages(result, 'img-result');
    currentTask.inProgress = false;
    currentTask.result = result;
    log(currentTask)
}

function showErrorResult(error) {
    logError(error);
    currentTask.inProgress = false;
}

export function downloadImage() {
    const compressedBlob = new Blob([currentTask.result], { type: 'image/png' });
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentTask.fileName.replace('.png', '.min.png');
    link.style = 'display: none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

function appendImageToImages(data, cls) {
    return new Promise((resolve, reject) => {
        const dataView = new Uint8Array(data);
        const blob = new Blob([dataView], { type: 'image/png' });
        const imageUrl = URL.createObjectURL(blob);
        const imageEl = document.createElement('img');
        imageEl.style.display = 'none';
        imageEl.src = imageUrl;
        imageEl.className = cls;
        imageEl.onload = e => {
            imageEl.origWidth = imageEl.width;
            imageEl.origHeight = imageEl.height;
            // const imagesAreaEl = document.querySelector('.images');
            // imagesAreaEl.appendChild(imageEl);
            imageEl.style.display = 'block';
            URL.revokeObjectURL(imageUrl);
            resolve(imageEl);
        };
        imageEl.onerror = e => {
            reject('Error loading image, maybe it\'s not in PNG format?');
        };
    });
}
