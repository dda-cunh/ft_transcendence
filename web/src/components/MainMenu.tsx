import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/MainMenu.module.css"

function MainMenuButtons({ onStart })
{

  return (
    <>
      <h1 className={styles.title}>TRANSCENDANCE PONG</h1>
      <div className={styles.buttons}>
        <button className={`${styles.btn} ${styles.singlematch}`} onClick={() => onStart("pongmatch")}>
          Single Match
        </button>
        <button className={`${styles.btn} ${styles.tournament}`}>Tournament</button>
      </div>
    </>
  );

}

function  SettingsBtn({ btnVal, onAction })
{

  return (<button className={`${styles.settingbtn}`} onClick={() => onAction()} >{btnVal}</button>);
}

function  ItemList({ settings })
{
  const labels = [];

  for (let i = 0; i <  settings.labels.length; i++)
  {
    let j = 0;  //  WRONG!!! MUST USE STATE!
    let valsList = settings.btnVals[i];
    let currentVal = valsList[0]

    function  handleClickSettings()
    {
      j++;
      if (j === valsList.length)
        j = 0;
      currentVal = valsList[i];
      console.log(currentVal);
    }


    labels.push(<b className={`${styles.settinglabel}`}>{settings.labels[i]}</b>);
    labels.push(<SettingsBtn btnVal={currentVal} onAction={handleClickSettings} />)
  }

  return (labels);
}

function  SettingsItems({ settings })
{
  const settingLabels = [];

  settingLabels.push(<div className={`${styles.settingsbox}`}>
                        <ItemList settings={settings} />
                      </div>
                    );

  return (settingLabels);
}

function  SettingsButtons()
{
  const settingsButtons = [];



  return (settingsButtons);
}


//  MOVE THIS TO DIFFERENT FILE

function  SettingsPanel({ settings })
{
  //        TITLE
  //  BUTTONS  OPTIONS
  return (
    <>
      <div className={`${styles.switches}`}>
        <h2>{settings.header}</h2>
        <div className={`${styles.menubox}`}>
          <SettingsItems settings={settings} />
        </div>
      </div>
    </>
  );
}

const MainMenu: React.FC = ({ appSettings, setAppStatus }) =>
{

  const gameplaySettings = 
  {
    header: "GAMEPLAY SETTINGS",
    labels: ["GAME MODE", "MULTIPLAYER MODE"],
    btnVals: [
              ["ORIGINAL", "ENHANCED"],
              ["LOCAL", "REMOTE"],
              ],
  };

  const visualSettings = {
    header: "VISUAL SETTINGS",
    labels: ["PADDLE COLOR", "BALL COLOR", "BACKGROUND COLOR"],
    btnVals: [
      [
        ["WHITE"],
        ["YELLOW"],
        ["RED"],
      ],
      [
        ["WHITE"],
        ["YELLOW"],
        ["RED"],
      ],
      [
        ["BLACK"],
        ["BLUE"],
        ["PURPLE"],
      ],
    ],
  };

  return (
    <div className={styles.menubox}>
      <MainMenuButtons onStart={setAppStatus} />
      <SettingsPanel settings={gameplaySettings} />
      <SettingsPanel settings={visualSettings} />
    </div>
  );
}

export default MainMenu;
