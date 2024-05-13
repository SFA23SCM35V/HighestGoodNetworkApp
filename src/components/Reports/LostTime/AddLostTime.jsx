import React, { useEffect, useState } from 'react';
import { useDispatch, connect, useSelector } from 'react-redux';
import MemberAutoComplete from 'components/Teams/MembersAutoComplete';
import AddProjectsAutoComplete from 'components/UserProfile/TeamsAndProjects/AddProjectsAutoComplete';
import AddTeamsAutoComplete from 'components/UserProfile/TeamsAndProjects/AddTeamsAutoComplete';
import './../reportsPage.css';
import moment from 'moment-timezone';
import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../../Header/DarkModeButton.css'
import { isEmpty, isEqual } from 'lodash';
import { getUserProfile } from 'actions/userProfile';
import { postTimeEntry } from 'actions/timeEntries';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

const AddLostTime = props => {

  const darkMode = useSelector((state) => state.theme.darkMode);

  const initialForm = {
    projectId: undefined,
    personId: undefined,
    teamId: undefined,
    dateOfWork: moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    isTangible: true,
  };

  const dispatch = useDispatch();

  const [entryType, setEntryType] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [inputs, setInputs] = useState(initialForm);
  
  const [selectedTeam, setSelectTeam] = useState(undefined);
  const [selectedProject, setSelectProject] = useState(undefined);
  const [searchText, setSearchText] = useState('');
  const [searchTeamText, setSearchTeamText] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (inputs.personId && props.userProfile._id !== inputs.personId) {
      props.getUserProfile(inputs.personId);
    }
  });

  useEffect(() => {
    if (!props.isOpen && entryType != '') {
      resetForm();
    }
  });

  const selectProject = project => {
    setInputs(inputs => ({
      ...inputs,
      projectId: project._id,
      personId: undefined,
      teamId: undefined,
    }));
    setSelectProject(project);
  };

  const selectUser = person => {
    if(person){
      setInputs(inputs => ({
        ...inputs,
        projectId: undefined,
        personId: person._id,
        teamId: undefined,
      }));
    }
  };

  const selectTeam = team => {
    setInputs(inputs => ({
      ...inputs,
      projectId: undefined,
      personId: undefined,
      teamId: team._id,
    }));
    setSelectTeam(team);
  };

  const handleFormContent = () => {
    if (entryType == 'project') {
      return (
        <FormGroup>
          <Label className={darkMode ? 'text-light' : ''}>Project Name</Label>
          <AddProjectsAutoComplete
            projectsData={props.projects}
            onDropDownSelect={selectProject}
            selectedProject={selectedProject}
          />
          {'projectId' in errors && (
            <div className="text-danger">
              <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.projectId}</small>
            </div>
          )}
        </FormGroup>
      )
    } else if (entryType == 'person') {
      return (
        <>
          <FormGroup>
            <Label className={darkMode ? 'text-light' : ''}>Name</Label>
            <MemberAutoComplete
              userProfileData={{userProfiles: props.users}}
              onAddUser={selectUser}
              searchText={searchText}
              setSearchText={setSearchText}
            />
            {'personId' in errors && (
              <div className="text-danger">
                <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.personId}</small>
              </div>
            )}
          </FormGroup>
        </>
      )
    } else if (entryType == 'team') {
      return (
        <FormGroup>
          <Label className={darkMode ? 'text-light' : ''}>Team Name</Label>
          <AddTeamsAutoComplete
            teamsData={{allTeams: props.teams}}
            onDropDownSelect={selectTeam}
            setNewTeamName={setNewTeamName} 
            newTeamName={newTeamName}
            selectedTeam={selectedTeam}
            searchText={searchTeamText}
            setSearchText={setSearchTeamText}
            addLostHour={true}
          />
          {'teamId' in errors && (
            <div className="text-danger">
              <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.teamId}</small>
            </div>
          )}
        </FormGroup>
      )
    } else {
      return (<></>)
    }
  };

  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleTypeChange = event => {
    setEntryType(event.target.value);
    if (!isEqual(inputs, initialForm)) {
      setInputs(initialForm);
    }
    if (searchText != '') {
      setSearchText('');
    }
    if (searchTeamText != '') {
      setSearchTeamText('');
    }
    if (!isEqual(errors, {})) {
      setErrors({});
    }
  }

  const resetForm = () => {
    setInputs(initialForm);
    setEntryType('');
    setSearchText('');
    setSearchTeamText('');
    setErrors({});
  }
  const handleCancel = closed => {
    resetForm();
    props.toggle();
  };

  const validateInputs = () => {
    const result = {};

    const date = moment(inputs.dateOfWork);
    const today = moment(
      moment()
        .tz('America/Los_Angeles')
        .format('YYYY-MM-DD'),
    );
    if (!date.isValid()) {
      result.dateOfWork = 'Invalid date';
    } else if (
        today.diff(date, 'days') < 0
    ) {
      result.dateOfWork = 'Cannot add lost time for future dates.';
    }

    if (inputs.hours === 0 && inputs.minutes === 0) {
      result.time = 'Time is required';
    } else {
      const hours = inputs.hours * 1;
      const minutes = inputs.minutes * 1;
      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        result.time = 'Hours and minutes should be integers';
      }
      if (hours < 0 || minutes < 0) {
        result.time = 'Time should be greater than 0';
      }
    }

    if (entryType == 'project' && inputs.projectId == undefined) {
      result.projectId = 'Project is required';
    }
    if (entryType == 'person' && inputs.personId == undefined) {
      result.personId = 'Person is required';
    }
    if (entryType == 'team' && inputs.teamId == undefined) {
      result.teamId = 'Team is required';
    }

    setErrors(result);
    return isEmpty(result);
  };

  const updateHours = async (userProfile, timeEntry, hours, minutes) => {
    const { hoursByCategory } = userProfile;
    const { isTangible, personId } = timeEntry;
    const volunteerTime = parseFloat(hours) + parseFloat(minutes) / 60;

    if (isTangible !== 'true') {
      userProfile.totalIntangibleHrs += volunteerTime;
    } else {
      hoursByCategory['unassigned'] += volunteerTime;
    }

    try {
      const url = ENDPOINTS.USER_PROFILE_PROPERTY(personId);
      await axios.patch(url, { key: 'hoursByCategory', value: hoursByCategory });
      await axios.patch(url, { key: 'totalIntangibleHrs', value: userProfile.totalIntangibleHrs });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async event => {
    if (event) event.preventDefault();
    if (isSubmitting) return;
    if (!validateInputs()) return;

    const timeEntry = {
      personId: inputs.personId,
      dateOfWork: inputs.dateOfWork,
      projectId: inputs.projectId,
      teamId: inputs.teamId,
      isTangible: inputs.isTangible.toString(),
      entryType: entryType,
    };

    timeEntry.timeSpent = `${inputs.hours}:${inputs.minutes}:00`;

    if(inputs.personId) {
      updateHours(props.userProfile, timeEntry, inputs.hours, inputs.minutes);
    }

    setSubmitting(true);
    let timeEntryStatus;
    timeEntryStatus = await dispatch(postTimeEntry(timeEntry));
    setSubmitting(false);

    if (timeEntryStatus !== 200) {
      props.toggle();
      alert(
        `An error occurred while attempting to submit your time entry. Error code: ${timeEntryStatus}`,
      );
      return;
    }

    setInputs(initialForm);
    setErrors({});
    if (props.isOpen) props.toggle();
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={props.toggle} className={darkMode ? 'bg-space-cadet text-light' : ''}>
        Add Lost Time
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
          <FormGroup>
            <Label for="entryType" className={darkMode ? 'text-light' : ''} >Type</Label><br/>
            <div className={`type-container ${darkMode ? 'text-light' : ''}`}>
              <div className='type-item' style={{paddingLeft: '20px'}} >
                <Input
                  type="radio"
                  id="project"
                  name='entryType'
                  value="project"
                  onChange={handleTypeChange}
                />
                <Label htmlFor="project" className={darkMode ? 'text-light' : ''}>Project</Label>
              </div>
              <div className='type-item'>
                <Input  
                  type="radio"
                  id="person"
                  name='entryType'
                  value="person"
                  onChange={handleTypeChange}
                />
                <Label htmlFor="person" className={darkMode ? 'text-light' : ''}>Person</Label>
              </div>
              <div className='type-item'>
                <Input
                  type="radio"
                  id="team"
                  name='entryType'
                  value="team"
                  onChange={handleTypeChange}
                />
                <Label htmlFor="team" className={darkMode ? 'text-light' : ''}>Team</Label>
              </div>
            </div>
          </FormGroup>
          {entryType != '' && (
            <>
              {handleFormContent()}
              <FormGroup>
                <Label for="dateOfWork" className={darkMode ? 'text-light' : ''}>Date</Label>
                <Input
                  type="date"
                  name="dateOfWork"
                  id="dateOfWork"
                  value={inputs.dateOfWork}
                  onChange={handleInputChange}
                />
                {'dateOfWork' in errors && (
                  <div className="text-danger">
                    <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.dateOfWork}</small>
                  </div>
                )}
              </FormGroup>
              <FormGroup>
              <Label for="timeSpent" className={darkMode ? 'text-light' : ''}>Time (HH:MM)</Label>
              <Row form>
                <Col>
                  <Input
                    type="number"
                    name="hours"
                    id="hours"
                    min={0}
                    max={40}
                    placeholder="Hours"
                    value={inputs.hours}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col>
                  <Input
                    type="number"
                    name="minutes"
                    id="minutes"
                    min={0}
                    max={59}
                    placeholder="Minutes"
                    value={inputs.minutes}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
              {'time' in errors && (
                <div className="text-danger">
                  <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.time}</small>
                </div>
              )}
            </FormGroup>
            <FormGroup check>
              <Label check className={darkMode ? 'text-light' : ''}>
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={inputs.isTangible}
                  onChange={e => {
                    e.persist();
                    setInputs(inputs => ({
                      ...inputs,
                      [e.target.name]: e.target.checked,
                    }));
                  }}
                />
                Tangible
              </Label>
            </FormGroup>
            </>
          )}
        </Form>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button onClick={handleCancel} color="danger" style={darkMode ? boxStyleDark : boxStyle}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" style={darkMode ? boxStyleDark : boxStyle}>
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStateToProps = state => ({
  userProfile: state.userProfile,
  auth: state.auth,
});

export default connect(mapStateToProps, {getUserProfile})(AddLostTime);