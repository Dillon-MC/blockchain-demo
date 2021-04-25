const crypto = require('crypto');

interface IBlockProps {
    index: number,
    nonce: number,
    data: string,
    timestamp: string,
    prevHash: string,
    hash: string
}

interface ICreateBlockProps {
    index: number,
    data: string,
    prevBlock: IBlockProps | null
}

export const createBlock = async({ index, data, prevBlock }: ICreateBlockProps): Promise<IBlockProps> => {
    const newBlock: IBlockProps = {
        index: index,
        nonce: 0,
        data: data,
        timestamp: prevBlock ? new Date().toUTCString() : 'Sat, 24 Apr 2021 14:32:41 GMT',
        prevHash: prevBlock ? prevBlock.hash : '0',
        hash: ''
    }

    createHashSync(newBlock).then(newHash => newBlock.hash = newHash);

    return Promise.resolve(newBlock);
}

export const createHashSync = async (block: IBlockProps): Promise<string> => {
    let hash = block.hash;
    if(hash.slice(0, 3) === "000") {
        return Promise.resolve(hash);
    }
    
    while(hash.slice(0, 3) !== "000") {
        block.nonce++;
        hash = crypto.createHash('SHA256').update(
            block.index+
            block.timestamp+
            `${block.data}`+
            block.prevHash+
            block.nonce
        ).digest('hex');
    }
    return Promise.resolve(hash);
}

export const createHashASync = (block: IBlockProps): string => {
    let hash = block.hash;
    if(hash.slice(0, 3) === "000") {
        return hash;
    }
    
    while(hash.slice(0, 3) !== "000") {
        block.nonce++;
        hash = crypto.createHash('SHA256').update(
            block.index+
            block.timestamp+
            `${block.data}`+
            block.prevHash+
            block.nonce
        ).digest('hex');
    }
    return hash;
}