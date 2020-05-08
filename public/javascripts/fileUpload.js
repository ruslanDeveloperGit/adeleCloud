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
    allFilesSize = Number(allFilesSize.toFixed(3))
    if (allFilesSize > 12) {
        $("#file-size").removeClass('file-size-green').addClass('file-size-orange')
    }
    if (allFilesSize > 16) {
        $('.create-saving-button').removeClass('btn-outline-success').addClass("btn-outline-danger disabled")
        $('#file-size').removeClass('file-size-orange').addClass('file-size-red')
    }
    $('#file-size').text(`${allFilesSize}MB / 16MB`);
})
pond.addEventListener('FilePond:removefile', (e) => {
    let fileSize = Number(e.detail.file.fileSize);
    fileSize = Number(fileSize) / Math.pow(10, 6);
    allFilesSize = allFilesSize - Number(fileSize)
    allFilesSize = Number(allFilesSize.toFixed(3))
    if ( allFilesSize <= 0) {
        allFilesSize = 0
    }
    if (allFilesSize < 16) {
        $('.create-saving-button').removeClass('btn-outline-danger')
        $('.create-saving-button').removeClass('disabled').addClass("btn-outline-success")
        $('#file-size').removeClass('file-size-red').addClass('file-size-orange')
    }
    if (allFilesSize < 12) {
        $('#file-size').removeClass('file-size-orange').addClass('file-size-green')
    }
    $('#file-size').text(`${allFilesSize}MB / 16MB`)
})

FilePond.setOptions({
    maxFileSize: '16MB',
    maxTotalFileSize: '16MB',
    labelMaxFileSizeExceeded: 'Файл слишком большой',
    labelMaxFileSize: 'Максимальный размер файла {filesize}',
    labelMaxTotalFileSizeExceeded: 'Максимальный размер всех файлов достигнут',
    labelMaxTotalFileSize: 'Максимальный размер всех файлов {filesize}',
    labelIdle: 'Перенеси свои файлы или <span class="filepond--label-action"> Найди </span>',
    lableInvalidField: 'Поле содержит неизвестные файлы',
    labelFileWaitingForSize: 'Ожидание размера',
    labelFileSizeNotAvaliable: 'Размер недоступен',
    labelFileLoading: 'Загрузка',
    labelFileLoadError: 'Ошибка во время загрузки',
    labelFileProcessing: 'Обработка',
    labelFileProcessingComplete: 'Обработка завершена',
    labelFileProcessingAborted: 'Обработка завершена',
    labelFileProcessingError: 'Ошибка обработки',
    labelFileRemoveError: 'Удалить файл',
    labelTapToCancel: 'Нажмите для отмены',
    labelTapToRetry: 'Нажмите для повтора',
    labelTapToUndo: 'Нажмите, чтобы отменить'

})

FilePond.create(
    document.querySelector('input.file-input')
);