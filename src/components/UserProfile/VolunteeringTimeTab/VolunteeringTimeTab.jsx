import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col, Button, FormGroup, FormFeedback } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import HistoryModal from './HistoryModal';
import './timeTab.css';
import { boxStyle, boxStyleDark } from 'styles';
import { formatDate, formatDateYYYYMMDD, formatDateMMDDYYYY, isBefore  } from 'utils/formatDate';


const MINIMUM_WEEK_HOURS = 0;
const MAXIMUM_WEEK_HOURS = 168;

const startEndDateValidation = props => {
  return (
    props.userProfile.startDate > props.userProfile.endDate && props.userProfile.endDate !== ''
  );
};


const StartDate = props => {
  const {darkMode} = props;

  if (!props.canEdit) {
    return <p className={darkMode ? 'text-azure' : ''}>{formatDateYYYYMMDD(props.userProfile.startDate)}</p>;
  }
  
  
  return (
    <>
      <Input
        type="date"
        name="StartDate"
        id="startDate"
        className={startEndDateValidation(props) ? 'border-error-validation' : null}
        value={props.userProfile.startDate}
        min={isBefore('2022-01-01', props.userProfile.createdDate) ?
          formatDateYYYYMMDD(props.userProfile.createdDate)
          : ''
        }
        onChange={e => {
          props.setUserProfile({ ...props.userProfile, startDate: e.target.value });
          props.onStartDateComponent(e.target.value);
        }}
        placeholder="Start Date"
        invalid={!props.canEdit}
        max={props.userProfile.endDate ? formatDateYYYYMMDD(props.userProfile.endDate) : ''}
      />
      <FormFeedback tooltip>
        Oh noes! that name is already taken
      </FormFeedback>
    </>
  );
};

const EndDate = props => {
  const {darkMode} = props;

  if (!props.canEdit) {
    return (
      <p className={darkMode ? 'text-azure' : ''}>
        {props.userProfile.endDate
          ? formatDateYYYYMMDD(props.userProfile.endDate)
          : 'N/A'}
      </p>
    );
  }

  return (
    <Input
      className={startEndDateValidation(props) ? 'border-error-validation' : null}
      type="date"
      name="EndDate"
      id="endDate"
      value={
        props.userProfile.endDate ? props.userProfile.endDate.toLocaleString().split('T')[0] : ''
      }
      onChange={e => {
        props.setUserProfile({ ...props.userProfile, endDate: e.target.value });
        props.onEndDateComponent(e.target.value);
      }}
      placeholder="End Date"
      invalid={!props.canEdit}
      min={
        props.userProfile.startDate
          ? formatDateYYYYMMDD(props.userProfile.startDate)
          : ''
      }
    />
  );
};

const WeeklySummaryOptions = props => {
  const {darkMode} = props;

  if (!props.canEdit) {
    return (
      <p className={darkMode ? 'text-azure' : ''}>
        {props.userProfile.weeklySummaryOption ??
          (props.userProfile.weeklySummaryNotReq ? 'Not Required' : 'Required')}
      </p>
    );
  }

  const summaryOptions = [
    { value: 'Required', text: 'Required' },
    { value: 'Not Required', text: 'Not Required (Slate Gray)' },
    { value: 'Team Fabulous', text: 'Team Fabulous (Fuschia)' },
    { value: 'Team Marigold', text: 'Team Marigold (Orange)' },
    { value: 'Team Luminous', text: 'Team Luminous (Yellow)' },
    { value: 'Team Lush', text: 'Team Lush (Green)' },
    { value: 'Team Skye', text: 'Team Skye (Blue)' },
    { value: 'Team Azure', text: 'Team Azure (Indigo)' },
    { value: 'Team Amethyst', text: 'Team Amethyst (Purple)' },
  ];

  const handleOnChange = e => {
    let temp = { ...props.userProfile };
    temp.weeklySummaryOption = e.target.value;
    if (e.target.value === 'Not Required') {
      temp.weeklySummaryNotReq = true;
    } else {
      temp.weeklySummaryNotReq = false;
    }
    props.setUserProfile(temp);
  };

  return (
    <FormGroup>
      <select
        name="WeeklySummaryOptions"
        id="weeklySummaryOptions"
        className="form-control"
        disabled={!props.canEdit}
        value={
          props.userProfile.weeklySummaryOption ??
          (props.userProfile.weeklySummaryNotReq ? 'Not Required' : 'Required')
        }
        onChange={handleOnChange}
      >
        {summaryOptions.map(({ value, text }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </FormGroup>
  );
};

const WeeklyCommittedHours = props => {
  //Do Not change the property name "weeklycommittedHours"
  //Otherwise it will not update in the backend.

  const {darkMode} = props;

  if (!props.canEdit) {
    return <p className={darkMode ? 'text-azure' : ''}>{props.userProfile.weeklycommittedHours}</p>;
  }
  const handleChange = e => {
    // Max: 168 hrs  Min: 0 hr
    // Convert value from string into easy number
    const value = parseInt(e.target.value);
    if (value > MAXIMUM_WEEK_HOURS) {
      // Check if Value is greater than maximum hours and set it to maximum hours if needed
      alert(`You can't commit more than ${MAXIMUM_WEEK_HOURS} hours per week.`);
      props.setUserProfile({ ...props.userProfile, weeklycommittedHours: MAXIMUM_WEEK_HOURS });
    } else if (value < MINIMUM_WEEK_HOURS) {
      //Check if value is less than minimum hours and set it to minimum hours if needed
      alert(`You can't commit less than ${MINIMUM_WEEK_HOURS} hours per week.`);
      props.setUserProfile({ ...props.userProfile, weeklycommittedHours: MINIMUM_WEEK_HOURS });
    } else {
      //update weekly hours whatever numbers in the input
      props.setUserProfile({ ...props.userProfile, weeklycommittedHours: value });
    }
  };

  return (
    <Input
      type="number"
      min={MINIMUM_WEEK_HOURS - 1}
      max={MAXIMUM_WEEK_HOURS + 1}
      name="weeklycommittedHours"
      id="weeklycommittedHours"
      data-testid="weeklycommittedHours"
      value={props.userProfile.weeklycommittedHours}
      onChange={e => handleChange(e)}
      placeholder="Weekly Committed Hours"
    />
  );
};

const MissedHours = props => {
  const{darkMode} = props;

  if (!props.canEdit) {
    return <p className={darkMode ? 'text-azure' : ''}>{props.userProfile.missedHours ?? 0}</p>;
  }
  return (
    <Input
      type="number"
      name="missedHours"
      id="missedHours"
      data-testid="missedHours"
      value={props.userProfile.missedHours ?? 0}
      onChange={e => {
        props.setUserProfile({
          ...props.userProfile,
          missedHours: Math.max(Number(e.target.value), 0),
        });
      }}
      placeholder="Additional Make-up Hours This Week"
    />
  );
};

const TotalIntangibleHours = props => {
  const{darkMode} = props;

  if (!props.canEdit) {
    return <p className={darkMode ? 'text-azure' : ''}>{props.userProfile.totalIntangibleHrs}</p>;
  }
  return (
    <Input
      type="number"
      name="totalIntangibleHours"
      id="totalIntangibleHours"
      step=".01"
      data-testid="totalIntangibleHours"
      value={props.userProfile.totalIntangibleHrs ?? 0}
      onChange={e => {
        const newValue = Math.max(Number(e.target.value), 0).toFixed(2);
        props.setUserProfile({
          ...props.userProfile,
          totalIntangibleHrs: Number(newValue),
        });
      }}
      placeholder="Total Intangible Hours"
    />
  );
};

/**
 *
 * @param {*} props.userProfile
 * @param {*} props.isUserSelf
 * @param {Function} handleUserProfile
 *
 * @returns
 */
const ViewTab = props => {
  const { userProfile, setUserProfile, role, canEdit, canUpdateSummaryRequirements, darkMode } = props;
  const [totalTangibleHoursThisWeek, setTotalTangibleHoursThisWeek] = useState(0);
  const [totalTangibleHours, setTotalTangibleHours] = useState(0);
  const { hoursByCategory, totalIntangibleHrs } = userProfile;
  const [historyModal, setHistoryModal] = useState(false);

  const handleStartDates = async startDate => {

    // if(!userProfile.isFirstTimelog) {
    //   alert('This user has already logged time in the system. Are you sure you want to change the start date?');
    // }
    props.onStartDate(startDate);
  };

  const handleEndDates = async endDate => {
    props.onEndDate(endDate);
  };

  useEffect(() => {
    sumOfCategoryHours();
  }, [hoursByCategory]);

  const calculateTotalHrsForPeriod = timeEntries => {
    let hours = { totalTangibleHrs: 0, totalIntangibleHrs: 0 };
    if (timeEntries.length < 1) return hours;

    for (let i = 0; i < timeEntries.length; i++) {
      const timeEntry = timeEntries[i];
      if (timeEntry.isTangible) {
        hours.totalTangibleHrs += parseFloat(timeEntry.hours) + parseFloat(timeEntry.minutes) / 60;
      } else {
        hours.totalIntangibleHrs +=
          parseFloat(timeEntry.hours) + parseFloat(timeEntry.minutes) / 60;
      }
    }
    return hours;
  };

  //This function is return totalTangibleHours which is the sum of all the tangible categories
  const sumOfCategoryHours = () => {
    const hours = Object.values(hoursByCategory).reduce((prev, curr) => prev + curr, 0);
    setTotalTangibleHours(hours.toFixed(2));
  };

  const toggleHistoryModal = () => {
    setHistoryModal(!historyModal);
  };

  useEffect(() => {
    //Get Total Tangible Hours this week
    const startOfWeek = moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .format('YYYY-MM-DD');
    const endOfWeek = moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .format('YYYY-MM-DD');

    axios
      .get(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, startOfWeek, endOfWeek))
      .then(res => {
        const timeEntries = res.data;
        const output = calculateTotalHrsForPeriod(timeEntries);
        setTotalTangibleHoursThisWeek(output.totalTangibleHrs.toFixed(2));
      })
      .catch(err => {
        console.log(err.message);
      });

    //Get total tangible & intangible hours
    const createdDate = formatDateYYYYMMDD(userProfile.createdDate);
    const today = moment().format('YYYY-MM-DD');

    axios
      .get(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, createdDate, today))
      .then(res => {
        const timeEntries = res.data;
        sumOfCategoryHours();
      })
      .catch(err => {
        console.log(err.message);
      });
  }, []);

  const roundToTwo = num => {
    return +(Math.round(num * 100) / 100);
  };

  const handleOnChangeHours = (e, key) => {
    let value = e.target.value;
    if (!value) value = 0;
    setUserProfile({
      ...userProfile,
      hoursByCategory: {
        ...userProfile.hoursByCategory,
        [key]: Number(value),
      },
    });
  };

  return (
    <div data-testid="volunteering-time-tab">
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Account Created Date</Label>
        </Col>
        <Col md="6">
        <p className={darkMode ? 'text-azure' : ''}>{formatDateMMDDYYYY(userProfile.createdDate)}</p>
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Start Date</Label>
        </Col>
        <Col md="6">
          <StartDate
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            onStartDateComponent={handleStartDates}
            darkMode={darkMode}
          />
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>End Date</Label>
        </Col>
        <Col md="6">
          <EndDate
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            onEndDateComponent={handleEndDates}
            darkMode={darkMode}
          />
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Total Tangible Hours This Week</Label>
        </Col>
        <Col md="6">
          <p className={`hours-totalTangible-thisWeek ${darkMode ? 'text-azure' : ''}`}>{totalTangibleHoursThisWeek}</p>
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Weekly Summary Options </Label>
        </Col>
        <Col md="6">
          <WeeklySummaryOptions
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit && canUpdateSummaryRequirements}
            darkMode={darkMode}
          />
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Weekly Committed Hours </Label>
        </Col>
        <Col md="6" className="d-flex align-items-center">
          <WeeklyCommittedHours
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            darkMode={darkMode}
          />
          <HistoryModal
            isOpen={historyModal}
            toggle={toggleHistoryModal}
            userName={userProfile.firstName}
            userHistory={userProfile.weeklycommittedHoursHistory}
          />
          <span className="history-icon">
            <i className="fa fa-history" aria-hidden="true" onClick={toggleHistoryModal}></i>
          </span>
        </Col>
      </Row>
      {userProfile.role === 'Core Team' && (
        <Row className="volunteering-time-row">
          <Col md="6">
            <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Additional Make-up Hours This Week </Label>
          </Col>
          <Col md="6">
            <MissedHours
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              canEdit={canEdit}
              darkMode={darkMode}
            />
          </Col>
        </Row>
      )}
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Total Intangible Hours </Label>
        </Col>
        <Col md="6">
          <TotalIntangibleHours
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            darkMode={darkMode}
          />
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Total Tangible Hours </Label>
        </Col>
        <Col md="6" className="tangible-hrs-group">
          <p className={`hours-totalTangible ${darkMode ? 'text-azure' : ''}`}>{totalTangibleHours}</p>
          <Button
            size="sm"
            color="info"
            className="refresh-btn"
            onClick={() => props.loadUserProfile()}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Refresh
          </Button>
        </Col>
      </Row>
      {props?.userProfile?.hoursByCategory
        ? Object.keys(userProfile.hoursByCategory).map(key => (
            <React.Fragment key={'hours-by-category-' + key}>
              <Row className="volunteering-time-row">
                <Col md="6">
                  <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
                    {key !== 'unassigned' ? (
                      <>Total Tangible {capitalize(key)} Hours</>
                    ) : (
                      <>Total Unassigned Category Hours</>
                    )}
                  </Label>
                </Col>
                <Col md="6">
                  {canEdit ? (
                    <Input
                      type="number"
                      pattern="^\d*\.?\d{0,2}$"
                      id={`${key}Hours`}
                      step=".01"
                      min="0"
                      value={roundToTwo(userProfile.hoursByCategory[key])}
                      onChange={e => handleOnChangeHours(e, key)}
                      placeholder={`Total Tangible ${capitalize(key)} Hours`}
                    />
                  ) : (
                    <p className={darkMode ? 'text-azure' : ''}>{userProfile.hoursByCategory[key]?.toFixed(2)}</p>
                  )}
                </Col>
              </Row>
            </React.Fragment>
          ))
        : []}
    </div>
  );
};

export default ViewTab;
