import { Chat } from '@/components/Chat/Chat';
import { exportData } from '@/utils/app/importExport';
import { savePrompts } from '@/utils/app/prompts';
import { AppBar, Button, Toolbar, Typography, Box, createTheme, Divider, Stack, Tooltip, IconButton, Avatar, Menu, MenuItem, Chip, CssBaseline, FormControlLabel, Switch, Fab } from '@mui/material';
import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { GetServerSideProps, GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useEffect, useReducer, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ThemeProvider } from '@emotion/react';
import '@/utils/app/setup';
import { AgentPage } from '@/components/Agent/agent';
import { IStorageRecord, importZip } from '@/types/storage';
import SettingsIcon from '@mui/icons-material/Settings';
import GitHubIcon from '@mui/icons-material/GitHub';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import getConfig from 'next/config';
import { storageReducer } from '@/utils/app/storageReducer';
import { Label, LargeClickableLabel, LargeLabel, SmallClickableLabel, SmallLabel, SmallTextButton } from '@/components/Global/EditableSavableTextField';

const { publicRuntimeConfig } = getConfig();
const Home: React.FC<IStorageRecord> = () => {
  const { t } = useTranslation('chat');
  const [hasChange, setHasChange] = useState<boolean>(false);
  // STATE ----------------------------------------------
  const [storage, storageDispatcher] = useReducer<typeof storageReducer>((storage, action) => {
    const newStorage = storageReducer(storage, action);
    setHasChange(true);
    return newStorage;
  }, {type: 'storage', agents: [], groups: []} as IStorageRecord);

  const availableGroups = storage.groups;
  const availableAgents = storage.agents;
  
  const [lightMode, setLightMode] = useState<'dark' | 'light'>('dark');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isInit, setIsInit] = useState<boolean>(false);
  // REFS ----------------------------------------------
  // FETCH RESPONSE ----------------------------------------------

  // First loading
  useEffect(() => {
    if(isInit) return;
    const storage = localStorage.getItem('storage');
    if (storage) {
      console.log('load from storage');
      storageDispatcher({ type: 'set', payload: JSON.parse(storage) });
    }
    setIsInit(false);
    console.log('init');
  }, []);

  // BASIC HANDLERS --------------------------------------------

  const handleLightMode = (mode: 'dark' | 'light') => {
    setLightMode(mode);
    localStorage.setItem('theme', mode);
  };

  const handleExportSettings = () => {
    exportData(storage).finally(() => {
      setIsMenuOpen(false);
    });
  };

  const handleImportSettings = ({ target }: {target: HTMLInputElement}) => {
    if (!target.files?.length) return;
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {

      const data: IStorageRecord = await importZip(new Blob([event.target?.result!]));
      console.log(data);
      storageDispatcher({ type: 'set', payload: data });
      setIsMenuOpen(false);
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if(isSaving){
      console.log('saving');
      localStorage.setItem('storage', JSON.stringify(storage));
      setHasChange(false);
      setIsSaving(false);
    }
  }, [isSaving]);


  const tabs = ['Chat', 'Agent']
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        secondary: '#1E1E1E',
        default: '#121212', 
        paper: '#1E1E1E'
      }
    },
  });

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        secondary: '#F5F5F5',
        default: '#FFFFFF', 
        paper: '#FFFFFF'
      }
    },
  });
  return (
    <ThemeProvider theme={lightMode == "light" ? lightTheme : darkTheme }>
      <Head>
        <title>Multi-Agent Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: "100vw",
          height: "100vh"}}>
          <Box
            sx={{
              backgroundColor: 'info.main',
            }}>
            <Toolbar variant="regular">
            <Stack
              direction="row"
              spacing={2}
              sx={{
                flexGrow: 1,
                alignItems: "baseline",
              }}>
              <LargeLabel>
                Multi-Agent Chat
              </LargeLabel>
              
              <SmallLabel>
                {`${publicRuntimeConfig.version}`}
              </SmallLabel>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
              }}>
              {hasChange && <SmallClickableLabel onClick={() => setIsSaving(true)}>Save</SmallClickableLabel>}
              <FormControlLabel
                value="start"
                control={
                  <Switch
                    color="default"
                    checked={lightMode === 'light'}
                    onChange={() => handleLightMode(lightMode === 'light' ? 'dark' : 'light')} />
                }
                label={
                  <SmallLabel>
                    {lightMode === 'light' ? 'Light' : 'Dark'}
                  </SmallLabel>
                }
                labelPlacement="start"
              />
              {
                tabs.map((tab, i) => {
                  return (
                    <SmallClickableLabel
                      key = {i}
                      onClick = {() => setSelectedTab(tab)}>
                      {tab}
                    </SmallClickableLabel>
                  )
                })
              }
              <Tooltip title="View project on GitHub">
                <GitHubIcon
                fontSize='large'
                onClick={() => {
                  window.open('https://github.com/LittleLittleCloud/llm-chatroom');
                }} />
              </Tooltip>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <MoreVertIcon fontSize="large" onClick={() => setIsMenuOpen(true)} />
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}>
                  <MenuItem key="Export" onClick={handleExportSettings}>
                    <Button component="label">Export</Button>
                  </MenuItem>
                  <MenuItem key="Import">
                    <Button component="label">
                      Import
                      <input
                        type="file"
                        accept=".chat"
                        onChange={handleImportSettings}
                        hidden
                      />
                    </Button>
                  </MenuItem>
            </Menu>
              </Box>
            </Stack>
            </Toolbar>
          </Box>
      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          overflowY: 'scroll',
        }}>
        {selectedTab == 'Chat' &&
        <>
          <Chat
            groupRecords={availableGroups}
            agentRecords={availableAgents}
            storageDispatcher={storageDispatcher}/>
        </>
        }
        {selectedTab == 'Agent' && (
          <AgentPage
            availableAgents={availableAgents}
            storageDispatcher={storageDispatcher}
            />
        )}
      </Box>
      </Box>
      </ThemeProvider>
  );
};
export default Home;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
      ])),
    },
  };
};
