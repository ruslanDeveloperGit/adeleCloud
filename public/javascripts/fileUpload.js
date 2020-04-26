FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize
)

FilePond.parse(document.body);

const pond = document.querySelector('.filepond--root');

let allFilesSize = 0;

pond.addEventListener('FilePond:addfile', (e) => {
    let fileSize = e.detail.file.fileSize;
    fileSize = Number(fileSize)
    fileSize = Number(fileSize) / Math.pow(10, 6);
    allFilesSize += Number(fileSize);
    allFilesSize = Number(allFilesSize.toFixed(2))
    console.log(fileSize, allFilesSize)
    if (allFilesSize > 12) {
        $("#file-size").removeClass('file-size-green').addClass('file-size-orange')
    }
    if (allFilesSize > 20) {
        $('.create-saving-button').removeClass('btn-outline-success').addClass("btn-outline-danger disabled")
        $('#file-size').removeClass('file-size-orange').addClass('file-size-red')
    }
    $('#file-size').text(`${allFilesSize}MB / 20MB`);
})
pond.addEventListener('FilePond:removefile', (e) => {
    let fileSize = Number(e.detail.file.fileSize);
    fileSize = Number(fileSize) / Math.pow(10, 6);
    allFilesSize = allFilesSize - Number(fileSize)
    allFilesSize = Number(allFilesSize.toFixed(3))
    if (allFilesSize < 20) {
        $('.create-saving-button').removeClass('btn-outline-danger')
        $('.create-saving-button').removeClass('disabled').addClass("btn-outline-success")
        $('#file-size').removeClass('file-size-red').addClass('file-size-orange')
    }
    if (allFilesSize < 12) {
        $('#file-size').removeClass('file-size-orange').addClass('file-size-green')
    }
    $('#file-size').text(`${allFilesSize}MB / 20MB`)
})

FilePond.setOptions({
    maxFileSize: '20MB',
    labelMaxFileSize: 'The maximum file size is {filesize}',
})

FilePond.create(
    document.querySelector('input.file-input'),
    {
        addfile: (err, file) => {
            console.log(file)
        }
    }
);