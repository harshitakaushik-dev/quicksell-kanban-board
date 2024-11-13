import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import './App.css';

import List from './Components/List/List';
import Navbar from './Components/Navbar/Navbar';

function App() {
  // Define lists for ticket statuses, users, and priorities
  const statusList = ['In progress', 'Backlog', 'Todo', 'Done', 'Cancelled'];
  const userList = ['Anoop sharma', 'Yogesh', 'Shankar Kumar', 'Ramesh', 'Suresh'];
  const priorityList = [
    { name: 'No priority', priority: 0 },
    { name: 'Low', priority: 1 },
    { name: 'Medium', priority: 2 },
    { name: 'High', priority: 3 },
    { name: 'Urgent', priority: 4 },
  ];

  // Initialize state variables to manage grouping, ordering, and ticket details
  const [groupValue, setgroupValue] = useState(getStateFromLocalStorage() || 'status');
  const [orderValue, setorderValue] = useState('title');
  const [ticketDetails, setticketDetails] = useState([]);

  // Function to order data based on the selected value (priority or title)
  const orderDataByValue = useCallback(async (cardsArry) => {
    if (orderValue === 'priority') {
      // Sort tickets by priority in descending order
      cardsArry.sort((a, b) => b.priority - a.priority);
    } else if (orderValue === 'title') {
      // Sort tickets alphabetically by title
      cardsArry.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) {
          return -1;
        } else if (titleA > titleB) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    // Update ticket details after sorting
    await setticketDetails(cardsArry);
  }, [orderValue, setticketDetails]);

  // Function to save current group state to local storage
  function saveStateToLocalStorage(state) {
    localStorage.setItem('groupValue', JSON.stringify(state));
  }

  // Function to retrieve group state from local storage
  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem('groupValue');
    if (storedState) {
      return JSON.parse(storedState);
    }
    return null;
  }

  // useEffect hook to fetch data and set group state on component mount
  useEffect(() => {
    // Save the current grouping value to local storage
    saveStateToLocalStorage(groupValue);

    // Fetch data from the API
    async function fetchData() {
      const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
      await refactorData(response);
    }
    fetchData();

    // Refactor and map API response data for ticket details
    async function refactorData(response) {
      let ticketArray = [];
      if (response.status === 200) {
        // Map each ticket to its corresponding user object
        for (let i = 0; i < response.data.tickets.length; i++) {
          for (let j = 0; j < response.data.users.length; j++) {
            if (response.data.tickets[i].userId === response.data.users[j].id) {
              let ticketJson = { ...response.data.tickets[i], userObj: response.data.users[j] };
              ticketArray.push(ticketJson);
            }
          }
        }
      }
      // Update ticket details and sort them based on selected order
      await setticketDetails(ticketArray);
      orderDataByValue(ticketArray);
    }
  }, [orderDataByValue, groupValue]);

  // Function to handle changes in group value from Navbar component
  function handleGroupValue(value) {
    setgroupValue(value);
    console.log(value);
  }

  // Function to handle changes in order value from Navbar component
  function handleOrderValue(value) {
    setorderValue(value);
    console.log(value);
  }

  return (
    <>
      {/* Render Navbar component with props for grouping and ordering */}
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />

      {/* Display lists based on selected group value */}
      <section className="board-details">
        <div className="board-details-list">
          {{
            'status': (
              <>
                {statusList.map((listItem) => (
                  <List
                    key={listItem}
                    groupValue="status"
                    orderValue={orderValue}
                    listTitle={listItem}
                    listIcon=""
                    statusList={statusList}
                    ticketDetails={ticketDetails}
                  />
                ))}
              </>
            ),
            'user': (
              <>
                {userList.map((listItem) => (
                  <List
                    key={listItem}
                    groupValue="user"
                    orderValue={orderValue}
                    listTitle={listItem}
                    listIcon=""
                    userList={userList}
                    ticketDetails={ticketDetails}
                  />
                ))}
              </>
            ),
            'priority': (
              <>
                {priorityList.map((listItem) => (
                  <List
                    key={listItem.priority}
                    groupValue="priority"
                    orderValue={orderValue}
                    listTitle={listItem.priority}
                    listIcon=""
                    priorityList={priorityList}
                    ticketDetails={ticketDetails}
                  />
                ))}
              </>
            ),
          }[groupValue]}
        </div>
      </section>
    </>
  );
}

export default App;
