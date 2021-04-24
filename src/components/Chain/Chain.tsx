import React from 'react';
import './Chain.css';

interface IChainProps {
    children: React.ReactNode
}

const Chain = (props: IChainProps): JSX.Element => {
    return (
        <div className="chain">
            {props.children}
        </div>
    );
}

export default Chain;