import { useState } from 'react';
import './AddPeerBtn.css';
import { useAppContext } from '../../containers/Context';

const AddPeerBtn = ({addPeer}: {addPeer: Function}): JSX.Element => {
    const appContext = useAppContext();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    //adds a cooldown to stop the user from spamming the button
    const disableButton = () => {
        setIsDisabled(true);
        setTimeout(() => {
            setIsDisabled(false);
        }, 700);
    }

    return (
        <button className="addpeerbtn" disabled={isDisabled} onClick={(): void => {
            disableButton();
            appContext.addChain();
            addPeer();
        }}>
            <div className="tooltip">ADD PEER</div>
            <span className="material-icons">
                add
            </span>
        </button>
    );
}

export default AddPeerBtn;