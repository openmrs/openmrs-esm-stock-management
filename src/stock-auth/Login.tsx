import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Splash } from '../components/spinner/Splash';
import { LOGIN_URL } from '../constants';
import { useLoginMutation } from '../core/api/session';
import LoadingStatus from '../core/loadingStatus';
import { BreadCrumbs } from '../core/utils/breadCrumbs';
import "./Login.css";
import { selectStatus } from './authSlice';

interface LoginAccount{
    name: string,
    username: string | null,
    password: string | null

}

const parseAccounts = function(accounts: undefined | null| string) : (LoginAccount[] | null) {    
    if(accounts == null) return null;
    const loginAccounts = accounts.split(",").map(account => {
        let accountTrimed = account.trim();
        if(accountTrimed.length > 0){
            let accountTokens = accountTrimed.split(":");
            if(accountTokens.length > 0){
                const loginAccount: LoginAccount = {
                    name: accountTokens[0],
                    username: accountTokens.length > 1 ? accountTokens[1]: null,
                    password: accountTokens.length > 2 ? accountTokens[2]: null
                };
                return loginAccount;
            }
        }
        return null;
    }).filter(p => p != null);
    if(loginAccounts.length > 0){
        return loginAccounts as LoginAccount[];
    }
    return null;
} 

const LoginAccounts: React.FC<{accounts: undefined | null| string, onSelectAccount: (event: React.MouseEvent<HTMLLIElement>, loginAccount: LoginAccount) => void }> =  ({accounts, onSelectAccount}) =>{
    const[accountList, setAccountList] = useState<Array<LoginAccount> | null>(null);
        
    useEffect(() => {
        setAccountList(parseAccounts(accounts));
    },[accounts]);

    return <> 
    { accountList && <ul className="dev-accounts"> 
        {accountList?.map(account => {                    
            return <li key={account.username} onClick={ (e) => {onSelectAccount(e, account);}}>{account.name} ({account.username})</li>    
        })}
        </ul>
    }
    </>
}

const LoginForm  = () => {
    const [login, { error, isLoading }] = useLoginMutation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    
    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        login({username: username, password: password});
    };    

    const handleLoginAccountSelection  = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, loginAccount:LoginAccount) => {  
        event.preventDefault();      
        login({username: loginAccount.username, password: loginAccount.password});
    };  
    
    return <> 
  <div style={{ padding: 50, margin: '0 auto', width: "50%" }}>
    <form onSubmit={handleSubmit}>
        {error && 
            <div style={{color:"red", fontWeight: 'bold'}}>
                Login failed. Invalid username/password.<br/>
                {JSON.stringify(error)}
            </div>
        }
        {
            process.env.REACT_APP_DEV_USERS && <ul>
                <LoginAccounts accounts={process.env.REACT_APP_DEV_USERS} onSelectAccount={handleLoginAccountSelection}/>
            </ul>
        }
        <div className="form-group">
            <label htmlFor='username'>Username:</label>
            <input type="text" placeholder="Username" className="form-control" name='username' value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
            <label htmlFor='password'>Password:</label>
            <input type="password"  className="form-control" placeholder="Password" name='password' value={password} onChange={e => setPassword(e.target.value)} required/>
        </div>
        <button type='submit' className="btn" disabled={isLoading}>Login</button>
    </form>
  </div>
    </>
}

export const Login = () =>
{
    const [displayLogin, setDisplayLogin] = useState(false); 
    const loadingStatus = useSelector(selectStatus); 

    useEffect(()=>{
        new BreadCrumbs().clearBreadCrumbs();    
      },[]);

    useEffect(()=>{
        if(process.env.NODE_ENV !== "development"){   
            if(loadingStatus === LoadingStatus.NOT_AUTHENTICATED){
                window.location.href = LOGIN_URL;
            }
        }else{
            setDisplayLogin(loadingStatus !== LoadingStatus.LOADING);
        }
    },[loadingStatus])
    return <>
    {
        displayLogin ? <LoginForm/> : <Splash active={true}/>
    }
    </>
}