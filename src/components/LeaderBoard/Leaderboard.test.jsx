import React from 'react';
import { shallow } from 'enzyme';
import mockAdminState from '../../__tests__/mockAdminState';
import Leaderboard from './Leaderboard';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
describe('Leaderboard page structure', () => {
  let mountedLeaderboard, props;
  
  beforeEach(() => {
    props = mockAdminState;
    props.organizationData = { weeklyCommittedHours: 0, tangibletime: 0, totaltime: 0 };
    props.getLeaderboardData = jest.fn();
    props.loggedInUser = jest.fn();
    mountedLeaderboard = shallow(<Leaderboard {...props} />);
  });

  it('should be rendered with a table', () => {
    const table = mountedLeaderboard.find('Table');
    expect(table.length).toBe(1);
  });

  it('should be rendered with 5 Headers', () => {
    const tableHeader = mountedLeaderboard.find('thead');
    expect(tableHeader.length).toBe(1);

    const tableHeads = tableHeader.find('th');
    expect(tableHeads.length).toBeGreaterThanOrEqual(5);
  });

  it('should be rendered with mock Leaderboard data', () => {
    const leaderBoardBody = mountedLeaderboard.find('tbody');
    const leaderBoardItems = leaderBoardBody.find('tr');
    const lbData = mockAdminState.leaderBoardData;
    const lBLength = lbData.length;

    expect(leaderBoardItems.length).toBe(lBLength + 1);

    for (let i = 0; i < lBLength; i++) {
      const linkItem = leaderBoardItems.find({ to: `/userprofile/${lbData[i].personId}` });

      expect(linkItem.length).toBe(1);
      expect(linkItem.text().includes(lbData[i].name)).toBeTruthy();

      expect(
        leaderBoardItems.containsMatchingElement(
          <td>
            <span id="Total time">{lbData[i].totaltime}</span>
          </td>,
        ),
      ).toBeTruthy();

      expect(
        leaderBoardItems.containsMatchingElement(
          <td>
            <span title="Tangible time">{lbData[i].tangibletime}</span>
          </td>,
        ),
      ).toBeTruthy();
    }
  });
});
