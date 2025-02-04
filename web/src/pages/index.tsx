import React, { Component, useState } from "react";
import styles from "../styles/App.module.css";
import SimpleGame from "../components/SimpleGame";
import MainMenu from "../components/MainMenu";


class  AppSettings
{
  constructor()
  {
    
    const[appStatus, setAppStatus] = useState(0);
    /*  GAMEPLAY SETTINGS  */
    this.gameMode = 0;
    this.multiPlayerMode = 0;
//    const [gameMode, setGameMode] = useState(0);
//    const [multiPlayerMode, setMultiPlayerMode] = useState(0);

    /*  VISUAL SETTINGS    */
    this.paddleColor = 0;
    this.ballColor = 0;
    this.backGroundColor = 0;
//    const [paddleColor, setPaddleColor] = useState(0);
//    const [ballColor, setBallColor] = useState(0);
//    const [backGroundColor, setBackGroundColor] = useState(0);
  }

  setStatusToMenu()
  {
    setAppStatus(0);
  }

  setStatusToMatch = () =>
  {
    console.log(this.appStatus);
    setAppStatus(1);
  }
};


class  CurrentScreen extends Component
{
//  console.log(appSettings.appStatus);
//  if (appSettings.appStatus === 0)

  constructor(appSettings, appStatus, setAppStatus)
  {
    super();
    this.appSettings = appSettings;
    this.appStatus = appStatus;
    this.setAppStatus = setAppStatus;
  }


  render()
  {
//    if (this.appStatus == "mainmenu")
      return(<MainMenu appSettings={this.appSettings} setAppStatus={this.setAppStatus}/>);
  }

//  else if (appSettings.appStatus === 1)
//    return(<SimpleGame />);
}

const Index: React.FC = () => 
{
//  ADD loggedIn BOOLEAN, DISPLAY LOGIN PAGE IF false
//  MUST STORE SETTINGS IN AN OBJECT HERE
  const [appStatus, setAppStatus] = useState("mainmenu");
  const appSettings = new AppSettings();

  return (
    <>
      <div className={styles.container}>
          <div className={styles.container}>
            <CurrentScreen appSettings={appSettings} appStatus={appStatus} setAppStatus={setAppStatus} />
          </div>
      </div>
    </>
  );
};

export default Index; 