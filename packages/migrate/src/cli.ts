import prompts from 'prompts';

/**
 * 请求用户是否要做出更改
 * @param {string} tips 
 * @returns
 */
export const getUserCmdInput = (tips:string):Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const response = await prompts({
            type: 'text',
            name: 'value',
            message: tips
        });
        resolve(response.value);
    })
}

/**
 * 请求用户是否要做出更改
 * @param {string} tips 
 * @returns 
 */
export const getUserCmdConfirm = (tips:string):Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        const response = await prompts({
            type: 'confirm',
            name: 'value',
            message: tips,
            initial: true
        });
        resolve(response.value);
    })
}