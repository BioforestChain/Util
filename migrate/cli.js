const prompts = require('prompts');

const logCmdArrMsg = (arrMsg) => {
    chalk
}


/**
 * 请求用户是否要做出更改
 * @param {*} tips 
 * @returns 
 */
const getUserCmdConfirm = (tips) => {
    return new Promise(async (resolve,reject) => {
        const response = await prompts({
            type: 'confirm',
            name: 'value',
            message: tips,
            initial: true
        });
        resolve(response.value);
    })
}

module.exports = {
    getUserCmdConfirm
}