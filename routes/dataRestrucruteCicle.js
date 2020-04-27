for (let i = 0; i < userSavings.length; i++) {
    for (let j = 0; j < userSavings[i].files.length; j++) {
        let documentData = userSavings[i].files[j].docData;
        documentData = documentData.toString('base64')
        documentData = `data:${userSavings[i].files[j].docType};base64,${documentData}`
        if (imageTypes.includes(userSavings[i].files[j].docType)) {
            userSavings[i].files[j]['isImage'] = true
        }
        userSavings[i].files[j].docData = documentData
    }
}