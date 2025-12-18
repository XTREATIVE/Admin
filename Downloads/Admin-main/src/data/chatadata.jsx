// dummyData.js

import Sweater from "../assets/sweater.jpg";
import Twopiece from "../assets/Twopiece.jpg";
import Bag from "../assets/Bag.jpg";

export const dummyNotifications = [
    { title: 'New vendor registered', time: '5 mins ago' },
    { title: 'Customer placed an order', time: '10 mins ago' },
    { title: 'New loan application', time: '30 mins ago' },
  ];
  
  export const contacts = [
    { id: 1, name: 'Gaston Lapierre', lastMessage: 'How are you today?', time: '10:20 am', unread: false },
    { id: 2, name: 'Fantina LeBatelier', lastMessage: "Hey! reminder for tomorrow's meeting...", time: '11:03 am', unread: false },
    { id: 3, name: 'Gilbert Chicoine', lastMessage: '', time: 'now', typing: true, unread: true },
    { id: 4, name: 'Mignonette Brodeur', lastMessage: "Are we going to have this week's planning meeting having a great day here", time: 'Yesterday', unread: false },
    { id: 5, name: 'Hannah Reilly', lastMessage: 'Sent you the files.', time: '9:15 am', unread: false },
    { id: 6, name: 'Isaac Newton', lastMessage: 'Checkout this link.', time: '8:50 am', unread: false },
    { id: 7, name: 'Julia Roberts', lastMessage: 'Great job on the presentation!', time: 'Yesterday', unread: false },
    { id: 8, name: 'Kevin Durant', lastMessage: 'Let’s catch up later.', time: '2 days ago', unread: false },
  ];
  
  export const initialMessages = [
    { id: 1, from: 'them', text: "Hi Gaston, thanks for joining the meeting. Let's dive into our quarterly performance review.", time: '8:20 am', read: true },
    { id: 2, from: 'me', text: "Hi Gilbert, thanks for having me. I'm ready to discuss how things have been going.", time: '8:25 am', read: true },
    { id: 3, from: 'them', images: [Sweater, Bag, Twopiece], time: '8:26 am', read: false },
    { id: 4, from: 'me', text: "I appreciate your honesty. Can you elaborate on some of those challenges? I want to understand how we can support you better in the future.", time: '8:30 am', read: false },
    { id: 5, from: 'them', text: 'Here are the files you requested.', time: '9:16 am', read: true },
    { id: 6, from: 'me', text: 'Received them, thanks!', time: '9:17 am', read: true },
    { id: 7, from: 'them', text: 'Don’t forget to review the document.', time: '8:51 am', read: false },
    { id: 8, from: 'me', text: 'Will do it by EOD.', time: '8:55 am', read: false },
  ];
  