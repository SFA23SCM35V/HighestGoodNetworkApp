import React from 'react';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';

/**
 * The header row of the team table.
 */
export const TeamTableHeader = React.memo(({ onTeamNameSort, onTeamActiveSort,...props }) => {
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  return (
    <tr>
      <th scope="col" id="teams__order">
        #
      </th>
      <th scope="col">
        {/* Add the sorting button */}
        <button onClick={onTeamNameSort}>
          {TEAM_NAME}
        </button>
      </th>
      <th scope="col" id="teams__active">
        <button onClick={onTeamActiveSort}>
          {ACTIVE}
        </button>
      </th>
      <th scope="col" id="teams__members">
        {MEMBERS}
      </th>
      {(canDeleteTeam || canPutTeam) && <th scope="col" id="teams__delete"></th>}
    </tr>
  );
});

export default connect(null, { hasPermission })(TeamTableHeader);
