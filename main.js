let myId
let mimeType = 'text/plain'
let ensureId = () => {
    gapi.client.drive.files
        .list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name, mimeType)'
        })
        .then(response => {
            let files = response.result.files
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i]
                    if (file.mimeType == mimeType && file.name == 'dotdex') {
                        id = file.id
                        myId = id
                        downloadId(myId)
                        return
                    }
                }
            }
            gapi.client.drive.files
                .create({
                    uploadType: 'multipart',
                    name: 'dotdex',
                    mimeType: mimeType,
                    fields: 'id'
                })
                .then(response => {
                    id = response.result.id
                    myId = id
                })
        })
}
let uploadId = id => {
    console.log('upload' + ' ' + id)
    fetch(`https://www.googleapis.com/upload/drive/v3/files/${id}`, {
        method: 'PATCH',
        headers: new Headers({
            Authorization: `Bearer ${gapi.client.getToken().access_token}`,
            'Content-Type': 'text/plain'
        }),
        body: document.getElementById('board').innerText
    })
}
let downloadId = id => {
    fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
        method: 'GET',
        headers: new Headers({
            Authorization: `Bearer ${gapi.client.getToken().access_token}`,
            'Content-Type': 'text/plain'
        })
    }).then(response => {
        response.text().then(text => {
            document.getElementById('board').innerText = text
            u()
        })
    })
}
let initClient = () => {
    gapi.client
        .init({
            apiKey: 'AIzaSyAoGzRKCqNlCalMF9nKk9UxGtBNygY8k6M',
            clientId:
                '18830208597-7qaf4bhu75likfndk231vmaul0ckel01.apps.googleusercontent.com',
            discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ],
            scope: 'https://www.googleapis.com/auth/drive'
        })
        .then(() => {
            // ensureId()
        })
}
let handleClientLoad = () => {
    gapi.load('client:auth2', initClient)
}
let keyWords = ['select', 'insert', 'update', 'from', 'where']
let regexFromMyArray = new RegExp(keyWords.join('|'), 'ig')
let counter = 0
let u = () => {
    counter++
    document.getElementById('dummy').innerHTML = $('#board')
        .html()
        .replace(regexFromMyArray, function(str) {
            return '<span class="highlighted">' + str + '</span>'
        })
    let currentCounter = counter
    setTimeout(() => {
        if (currentCounter === counter) {
            uploadId(myId)
        }
    }, 1000)
}
$('#board').on('input', u)
let target = $('#dummy')
$('#board').scroll(function() {
    target.prop('scrollTop', this.scrollTop).prop('scrollLeft', this.scrollLeft)
})
