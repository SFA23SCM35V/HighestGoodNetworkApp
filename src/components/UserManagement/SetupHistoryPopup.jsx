import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import httpService from '../../services/httpService';
import { ENDPOINTS } from 'utils/URL';
import { formatDate } from 'utils/formatDate';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import UserTableFooter from './UserTableFooter';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import '../Header/DarkMode.css'
import { boxStyle, boxStyleDark } from 'styles';
const baseUrl = window.location.origin;

// Define Table Header
const TABLE_HEADER = ['Email', 'Weekly Committed Hours', 'Created Date', 'Expired Date', 'Status', 'Refresh', 'Cancel'];
// Define Status Column Text
const INV_STATUS = {ACITVE: 'Active', EXPIRED: 'Expired', CANCELLED: 'Cancelled', COMPLETED: 'Completed'};

const TableFilter = ({
  emailFilter, 
  statusFilter, 
  sortByCreationDateDesc, 
  sortByExpiredDateDesc,
  setEmailFilter, 
  setStatusFilter,
  setSortByCreationDateDesc,
  setSortByExpiredDateDesc,
  darkMode}) => {
  return (
    <tr>
      <td style={{ width: '20%' }}>
          {/* <label htmlFor="email-filter">Email</label> */}
          <input
            id="email-filter"
            type="text"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder='Your Email'
          />
      </td>
      <td id='weekly-committed' style={{ width: '10%' }}></td>
      <td style={{ width: '15%' }}>
        {/* <label htmlFor=" id='created-date'">Status</label> */}
        <select
          id=" id='created-date'"
          value={sortByCreationDateDesc}
          onChange={(e) => { 
            setSortByCreationDateDesc(e.target.value);
            if(e.target.value !== 'default'){
              setSortByExpiredDateDesc('default');    
            }}}
        >
          <option value={'default'}></option>
          <option value={true}>Latest First</option>
          <option value={false}>Oldest First</option>
        </select>
      </td>
      <td style={{ width: '15%' }}>
        {/* <label htmlFor=" id='expired-date'">Status</label> */}
        <select
          id=" id='expired-date'"
          value={sortByExpiredDateDesc}
          onChange={(e) =>{
             setSortByExpiredDateDesc(e.target.value);
             if(e.target.value !== 'default'){
              setSortByCreationDateDesc('default');
            }}}
        >
          <option value={'default'}></option>
          <option value={true}>Latest First</option>
          <option value={false}>Oldest First</option>
        </select>
      </td>
      <td style={{ width: '15%' }}>
        <div className="table-filter__item">
          {/* <label htmlFor="status-filter">Status</label> */}
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value={INV_STATUS.ACITVE}>Active</option>
            <option value={INV_STATUS.EXPIRED}>Expired</option>
            <option value={INV_STATUS.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </td>
      <td id='refresh' style={{ width: '10%' }}></td>
      <td id='cancel' style={{ width: '10%' }}></td>
   </tr>
  
  );
}



const SetupHistoryPopup = props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  // const [alert, setAlert] = useState({ visibility: 'hidden', message: '', state: 'success' });
  // const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  // const baseUrl = window.location.origin;
  const [setupInvitationData, setSetupInvitationData] = useState([]);
  const [filteredSetupInvitationData , setFilteredSetupInvitationData] = useState([]);
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortByCreationDateDesc, setSortByCreationDateDesc] = useState('default');
  const [sortByExpiredDateDesc, setSortByExpiredDateDesc] = useState('default');
  const [ selectedPage, setSelectedPage ] = useState(1);
  const [ pageSize, setPageSize ] = useState(10);
  const [ loading, setLoading ] = useState(true);
  const [ filteredUserDataCount, setFilteredUserDataCount ] = useState(0);
  const [ isButtonDisabled, setIsButtonDisabled ] = useState(false);
  const [noDataMsg,setNoDataMsg] = useState("No Data");
  
  const closePopup = e => {
    props.onClose();
  };

  useEffect(() => {
    if(props.open){
      httpService
      .get(ENDPOINTS.GET_SETUP_INVITATION())
      .then(res => {
        //  setSetupInvitationData(res.data);
         setSetupInvitationData(prevData => {
          const transformedData = transformedTableData(res.data)
          setFilteredSetupInvitationData(transformedData);
          setFilteredUserDataCount(transformedData.length && transformedData.length > 0 ? transformedData.length : 0);
          return res.data;
         });
      })
      .catch(err => {
         if(err?.response?.status==403){
               const msg = err?.response?.data;
               setNoDataMsg(msg);
         }else{
           toast.error(`Fetching error: Invitation History.`);
           setNoDataMsg("No Data");
         }
      })
      .finally( () =>{
        setLoading(false);
      });
    }
  }, [props.open]);

  /**
   * Triggered data fetching when a new user invitation is sent or a record is updated.
   */
  useEffect(() => {
    if(props.shouldRefreshInvitationHistory && props.open == true){
      httpService
      .get(ENDPOINTS.GET_SETUP_INVITATION())
      .then(res => {
        //  setSetupInvitationData(res.data);
         setSetupInvitationData(prevData => {
          const transformedData = transformedTableData(res.data)
          setFilteredSetupInvitationData(transformedData);
          setFilteredUserDataCount(transformedData.length && transformedData.length > 0 ? transformedData.length : 0);
          return res.data;
         });
      })
      .catch(err => {
        toast.error(`Fetching error: Invitation History.`);
      })
      .finally( () =>{
        setLoading(false);
        props.handleShouldRefreshInvitationHistory();
    });
    }
    return () => {
      // cleanup
    }
  }, [props.shouldRefreshInvitationHistory, props.open]);

  useEffect(() => {
    setFilteredSetupInvitationData(transformedTableData(setupInvitationData));
  }, [emailFilter, statusFilter, sortByCreationDateDesc, sortByExpiredDateDesc, selectedPage, pageSize]);
  /**
   * Apply filters and return a sorted and filtered data list.
   * @param {*} data 
   * @returns 
   */
  const transformedTableData = (data) => {
    /**
     * Filter data list by email and status
     */
    data = data || [];
    let filteredList = data.filter((invitation) => {

      const EXPIRED = invitation.expiredDate < Date.now();
      const CANCELLED = invitation.isCancelled;

      const emailMatch = invitation.email.toLowerCase().includes(emailFilter.toLowerCase());
      const statusMatch =
        statusFilter === INV_STATUS.ACITVE ? !EXPIRED && !CANCELLED :
        statusFilter === INV_STATUS.CANCELLED ? CANCELLED :
        statusFilter === INV_STATUS.EXPIRED ? EXPIRED : true;

      return (emailMatch && statusMatch);
    });

    const compareByCreationAndExpirationDate = (a, b) => {
      const createdDateComparison = sortByCreationDateDesc === "true" || sortByCreationDateDesc === 'default' ? 
        new Date(b.createdDate) - new Date(a.createdDate) : new Date(a.createdDate) - new Date(b.createdDate);
      if (createdDateComparison !== 0 && sortByCreationDateDesc !== 'default') {
          return createdDateComparison;
      }
      
      // If sortByExpiredDateDesc is true, sort in descending order, else sort in ascending order
      const expiredDateComparison = sortByExpiredDateDesc === "true" || sortByExpiredDateDesc === 'default'? 
        new Date(b.expiration) - new Date(a.expiration) : new Date(a.expiration) - new Date(b.expiration);
      return expiredDateComparison;
    };
    filteredList.sort(compareByCreationAndExpirationDate);

    setFilteredUserDataCount(filteredList.length);
    // pagination
    return filteredList.slice((selectedPage - 1) * pageSize, selectedPage * pageSize);
  }

  const onPageSelect = (page) => {
    setSelectedPage(page);
  }

  const onSelectPageSize = (size) => {
    setPageSize(size);
  }

  const onClickRefresh = (e, index) => {
    // send API to refresh the invitation
    setIsButtonDisabled(true);
   
    httpService
      .post(ENDPOINTS.REFRESH_SETUP_INVITATION_TOKEN(), {
        token: filteredSetupInvitationData[index].token,
        baseUrl: baseUrl,
      })
      .then((res) => {
        // debugger;
        if (res.status === 200) {
          // Close and reload data from database.
          props.handleShouldRefreshInvitationHistory()
          closePopup();
          toast.success('Invitation Refreshed!');
        }
      })
      .catch((err) => {
        toast.error('Invitation Refresh Failed!');
      }).finally(() => {
        setIsButtonDisabled(false);
      });
  };

  const onClickCancel = (e, index) => {

    setIsButtonDisabled(true);
    httpService
      .post(ENDPOINTS.CANCEL_SETUP_INVITATION_TOKEN(), {
        token: filteredSetupInvitationData[index].token,
      })
      .then((res) => {
        if (res.status === 200) {
          // Close and reload data from database.
          props.handleShouldRefreshInvitationHistory()
          closePopup();
          toast.success('Invitation Cancelled!');
        }
      })
      .catch((err) => {
        toast.error('Invitation Cancel Failed!');
      }).finally(() => {
        setIsButtonDisabled(false);
      });
  }


  return (
    <Modal isOpen={props.open} toggle={closePopup} size={'xl'} className={darkMode ? 'dark-mode text-light' : ''}>
      <ModalHeader
        toggle={closePopup}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
        className={darkMode ? 'bg-space-cadet' : ''}
      >
        Setup Invitation History
      </ModalHeader>
      <ModalBody style={{minHeight: (pageSize * 5) + 'vh'}} className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className="setup-invitation-popup-section">
        {loading ? <div>Data Loading...</div> : 
        setupInvitationData && setupInvitationData.length > 0 ? (
          <>
            <Table responsive className={`table table-bordered ${darkMode ? 'text-light' : ''}`}>
              <thead>
                <tr className={darkMode ? 'bg-space-cadet' : ''}>
                  {TABLE_HEADER.map((key, index) => (
                    <th key={index}> {key} </th>
                  ))}
                </tr>
              </thead>
              <tbody className={darkMode ? 'dark-mode' : ''}>
                <TableFilter 
                  emailFilter={emailFilter}
                  statusFilter={statusFilter}
                  sortByCreationDateDesc={sortByCreationDateDesc}
                  sortByExpiredDateDesc={sortByExpiredDateDesc}
                  setEmailFilter={setEmailFilter} 
                  setStatusFilter={setStatusFilter}
                  setSortByCreationDateDesc={setSortByCreationDateDesc}
                  setSortByExpiredDateDesc={setSortByExpiredDateDesc} 
                  darkMode={darkMode}
                />
                {filteredSetupInvitationData.map((record, index) => {
                  return <tr key={index}>
                      <td>{record.email}</td>
                      <td>{record.weeklyCommittedHours}</td>
                      <td>{formatDate(record.createdDate)}</td>
                      <td>{formatDate(record.expiration)}</td>
                      <td>{new Date(record.expiration) > Date.now() && !record.isCancelled ? INV_STATUS.ACITVE :
                            record.isCancelled ? INV_STATUS.CANCELLED :
                            new Date(record.expiration) < Date.now() ? INV_STATUS.EXPIRED : null}</td>
                      <td>
                      <Button 
                          key={index}
                          color='primary'
                          disabled={isButtonDisabled}
                          onClick={e => onClickRefresh(e, index)}>
                            Refresh
                        </Button>
                      </td>
                      <td>
                        <Button 
                          key={index}
                          color="danger"
                          onClick={e => onClickCancel(e, index)}>
                            Cancel
                        </Button>
                      </td>
                      
                    </tr>;
                })}
              </tbody>
            </Table>
            <UserTableFooter
               datacount={filteredUserDataCount}
               selectedPage={selectedPage}
               onPageSelect={onPageSelect}
               onSelectPageSize={onSelectPageSize}
               pageSize={pageSize}
               darkMode={darkMode}
            />
          </>
        ) : (
          <div>{noDataMsg}</div>
        )}
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SetupHistoryPopup;
