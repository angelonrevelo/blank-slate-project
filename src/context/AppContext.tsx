import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppContextType } from '@/types';

const defaultState = {
  version: '1.802 BETA',
  remLogin: true,
  shrinkBar: false,
  loggedUsername: '',
  userNameWithTitle: '',
  userNameFull: '',
  userLastname: '',
  userFirstname: '',
  userTitle: '',
  userBranch: '',
  userSignature: '',
  userSignatureLink: '',
  infoTab: 'BasicInfo',
  patientSort: 'DATE_DESC',
  loginBranch: 'Quezon',
  clearanceTab: 'Clearance',
  viewSetting: 'ViewMyTasks',
  recoverSession: false,
  viewingBranch: 'Quezon',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to persist state to localStorage
const persistToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(`vbe_${key}`, JSON.stringify(value));
  } catch (error) {
    // localStorage not available or quota exceeded
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

// Helper to get persisted state
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`vbe_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const [remLogin, setRemLoginState] = useState(() => 
    getFromStorage('remLogin', defaultState.remLogin)
  );
  const [shrinkBar, setShrinkBarState] = useState(defaultState.shrinkBar);
  const [loggedUsername, setLoggedUsernameState] = useState(() =>
    getFromStorage('loggedUsername', defaultState.loggedUsername)
  );
  const [userNameWithTitle, setUserNameWithTitleState] = useState(() =>
    getFromStorage('userNameWithTitle', defaultState.userNameWithTitle)
  );
  const [userNameFull, setUserNameFullState] = useState(() =>
    getFromStorage('userNameFull', defaultState.userNameFull)
  );
  const [userLastname, setUserLastnameState] = useState(() =>
    getFromStorage('userLastname', defaultState.userLastname)
  );
  const [userFirstname, setUserFirstnameState] = useState(() =>
    getFromStorage('userFirstname', defaultState.userFirstname)
  );
  const [userTitle, setUserTitleState] = useState(() =>
    getFromStorage('userTitle', defaultState.userTitle)
  );
  const [userBranch, setUserBranchState] = useState(() =>
    getFromStorage('userBranch', defaultState.userBranch)
  );
  const [userSignature, setUserSignatureState] = useState(() =>
    getFromStorage('userSignature', defaultState.userSignature)
  );
  const [userSignatureLink, setUserSignatureLinkState] = useState(() =>
    getFromStorage('userSignatureLink', defaultState.userSignatureLink)
  );
  const [infoTab, setInfoTabState] = useState(() =>
    getFromStorage('infoTab', defaultState.infoTab)
  );
  const [patientSort, setPatientSortState] = useState(() =>
    getFromStorage('patientSort', defaultState.patientSort)
  );
  const [loginBranch, setLoginBranchState] = useState(defaultState.loginBranch);
  const [clearanceTab, setClearanceTabState] = useState(defaultState.clearanceTab);
  const [viewSetting, setViewSettingState] = useState(() =>
    getFromStorage('viewSetting', defaultState.viewSetting)
  );
  const [recoverSession, setRecoverSessionState] = useState(defaultState.recoverSession);
  const [viewingBranch, setViewingBranchState] = useState(() =>
    getFromStorage('viewingBranch', defaultState.viewingBranch)
  );

  // Wrapper functions to persist state
  const setRemLogin = (value: boolean) => {
    setRemLoginState(value);
    persistToStorage('remLogin', value);
  };

  const setShrinkBar = (value: boolean) => setShrinkBarState(value);

  const setLoggedUsername = (value: string) => {
    setLoggedUsernameState(value);
    persistToStorage('loggedUsername', value);
  };

  const setUserNameWithTitle = (value: string) => {
    setUserNameWithTitleState(value);
    persistToStorage('userNameWithTitle', value);
  };

  const setUserNameFull = (value: string) => {
    setUserNameFullState(value);
    persistToStorage('userNameFull', value);
  };

  const setUserLastname = (value: string) => {
    setUserLastnameState(value);
    persistToStorage('userLastname', value);
  };

  const setUserFirstname = (value: string) => {
    setUserFirstnameState(value);
    persistToStorage('userFirstname', value);
  };

  const setUserTitle = (value: string) => {
    setUserTitleState(value);
    persistToStorage('userTitle', value);
  };

  const setUserBranch = (value: string) => {
    setUserBranchState(value);
    persistToStorage('userBranch', value);
  };

  const setUserSignature = (value: string) => {
    setUserSignatureState(value);
    persistToStorage('userSignature', value);
  };

  const setUserSignatureLink = (value: string) => {
    setUserSignatureLinkState(value);
    persistToStorage('userSignatureLink', value);
  };

  const setInfoTab = (value: string) => {
    setInfoTabState(value);
    persistToStorage('infoTab', value);
  };

  const setPatientSort = (value: string) => {
    setPatientSortState(value);
    persistToStorage('patientSort', value);
  };

  const setLoginBranch = (value: string) => setLoginBranchState(value);
  const setClearanceTab = (value: string) => setClearanceTabState(value);

  const setViewSetting = (value: string) => {
    setViewSettingState(value);
    persistToStorage('viewSetting', value);
  };

  const setRecoverSession = (value: boolean) => setRecoverSessionState(value);

  const setViewingBranch = (value: string) => {
    setViewingBranchState(value);
    persistToStorage('viewingBranch', value);
  };

  return (
    <AppContext.Provider
      value={{
        version: defaultState.version,
        remLogin,
        shrinkBar,
        loggedUsername,
        userNameWithTitle,
        userNameFull,
        userLastname,
        userFirstname,
        userTitle,
        userBranch,
        userSignature,
        userSignatureLink,
        infoTab,
        patientSort,
        loginBranch,
        clearanceTab,
        viewSetting,
        recoverSession,
        viewingBranch,
        setRemLogin,
        setShrinkBar,
        setLoggedUsername,
        setUserNameWithTitle,
        setUserNameFull,
        setUserLastname,
        setUserFirstname,
        setUserTitle,
        setUserBranch,
        setUserSignature,
        setUserSignatureLink,
        setInfoTab,
        setPatientSort,
        setLoginBranch,
        setClearanceTab,
        setViewSetting,
        setRecoverSession,
        setViewingBranch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
