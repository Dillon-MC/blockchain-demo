import React from 'react';
import './PeerList.css';

interface IPeerListProps {
    children: React.ReactNode
}

const PeerList = (props: IPeerListProps): JSX.Element => {
    return (
        <div className="peerlist">
            {props.children}
        </div>
    );
}

export default PeerList;