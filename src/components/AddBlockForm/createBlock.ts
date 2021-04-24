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

export const createBlock = ({ index, data, prevBlock }: ICreateBlockProps): IBlockProps => {
    const newBlock: IBlockProps = {
        index: index,
        nonce: 0,
        data: data,
        timestamp: new Date().toUTCString(),
        prevHash: prevBlock ? prevBlock.hash : '0',
        hash: ''
    }

    newBlock.hash = createHash(newBlock);

    return newBlock;
}

export const createHash = (block: IBlockProps): string => {
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