import React, { useState, useEffect } from 'react';
import TextSearchBox from './TextSearchBox';
import DropDownSearchBox from './DropDownSearchBox';
import userTableDataPermissions from 'utils/userTableDataPermissions';

/**
 * The header row of the user table.
 */
const UserTableSearchHeader = React.memo((props) => {
  const darkMode = props.darkMode;
  const isMobile = props.isMobile;
  const mobileFontSize = props.mobileFontSize;
  const mobileWidth = props.mobileWidth;

  const onFirstNameSearch = text => {
    props.onFirstNameSearch(text);
  };

  const onLastNameSearch = text => {
    props.onLastNameSearch(text);
  };

  const onRoleSearch = text => {
    props.onRoleSearch(text);
  };

  const onEmailSearch = text => {
    props.onEmailSearch(text);
  };

  const onWeeklyHrsSearch = text => {
    props.onWeeklyHrsSearch(text);
  };

  return (
    <tr className={darkMode ? 'bg-yinmn-blue text-light' : ''} style={{fontSize: isMobile ? mobileFontSize : 'initial'}}>
      <td id="user_active"></td>
      <td id="user_first">
        <TextSearchBox id={'firts_name_search'} searchCallback={onFirstNameSearch} placeholder=" Search First Name" style={{fontSize: isMobile ? mobileFontSize : 'initial'}}/>
      </td>
      <td id="user_last_name">
        <TextSearchBox id={'last_name_search'} searchCallback={onLastNameSearch} placeholder=" Search Last Name" style={{fontSize: isMobile ? mobileFontSize : 'initial'}}/>
      </td>
      <td id="user_role">
        <DropDownSearchBox id={'role_search'} items={props.roles} searchCallback={onRoleSearch} width={isMobile ? mobileWidth : 'initial'}/>
      </td>
      <td id="user_email" >
        <TextSearchBox id={'email_search'} searchCallback={onEmailSearch} style={{ width: isMobile ? mobileWidth : '100%' }} placeholder=" Search Email"/>
      </td>
      <td id="user_hrs" style= {{ display: 'flex' }}>
        <TextSearchBox
          id={'hrs_search'}
          style={{ maxWidth: '75px', margin: '0 auto', width: isMobile ? mobileWidth : 'initial' }}
          searchCallback={onWeeklyHrsSearch}
        />
      </td>
      <td id="user_pause"></td>
      <td id="user_requested_time_off"></td>
      <td id="user_finalDay"></td>
      <td id="user_resume_date"></td>
      <td id="user_start_date"></td>
      <td id="user_end_date"></td>
      {userTableDataPermissions(props.authRole, props.roleSearchText) && (
        <td id="user__delete"></td>
      )}
    </tr>
  );
});

export default UserTableSearchHeader;
