/**
 * Fetches Messages and channel members of selected channel
 */
import React, { useEffect, useState, useRef } from "react";
import Helmet from "react-helmet";
import { Avatar, Box, Button, Grid } from "@material-ui/core";
import { useStyles } from "../../style/messages";
import { fetchMessages, getChannelMembers, fetchChannelMetadata } from "../../services/pubnub";
import { useLocation } from "react-router";
import usePubNub from "../../utils/usePubNub";
import {
  capitalizeFirstLetter,
  capitalizeNameInitials,
  checkChannelMember,
  formatTimeToken,
  formatBannedMessage,
  getMessageFileUrl,
  membersFromLS,
  truncateChannelDescription,
  getMessageText,
} from "../../utils/helpers";
import Members from "./Members";
import MemberDetail from "./MemberDetail";
import Chat from "./Chat";
import { setLocalStorage } from "../../services/localStorage";
import MessagesCount from "./MessagesCount";
import ToggleChat from "./ToggleChat";

const Messages = () => {
  const firstUpdate = useRef(true);
  const classes = useStyles();
  const location = useLocation();
  const { pubnub } = usePubNub();
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState(membersFromLS());
  const [channel, setChannel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState();
  const [toggleMemberDetails, setToggleMemberDetails] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState([]);
  const [toggledVal, setToggledVal] = useState("chat");
  const [channelID, setChannelID] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState("");

  useEffect(() => {
    fetchChannelMembers();
    setLocalStorage("PubNubSelectedChannel", location.state.channel);
    setChannelID(location.state.channel);
    (async () => {
      try {
        const channelResponse = await fetchChannelMetadata(pubnub, location.state.channel);
        setChannel(channelResponse);
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (toggledVal === "chat") {
      setChannelID(location.state.channel);
    } else if (toggledVal === "banned") {
      setChannelID("banned." + location.state.channel);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggledVal]);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      if (channelID) fetchChannelMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  useEffect(() => {
    if (channelID && !loading) fetchChannelMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelID]);

  /**
   * Fetches channel members related to selected channel
   */
  const fetchChannelMembers = () => {
    setLoading(true);
    (async () => {
      try {
        const channelMembers = await getChannelMembers(pubnub, location.state.channel);
        setLocalStorage("PubNubChannelMembers", channelMembers.data);
        setMembers(channelMembers.data);
        setTotalCount(channelMembers.totalCount);
        setPage(channelMembers.next);
      } catch (e) {}
    })();
  };

  /**
   * Fetches channel messages related to selected channel
   */
  const fetchChannelMessages = () => {
    setMessages([]);
    (async () => {
      try {
        const channelMessages = await fetchMessages(pubnub, channelID);
        const messagesList = [];
        let messageObject = {};
        let index = 0;
        let messagesSet = [];
        if (channelMessages) {
          while (index <= members.length) {
            index++;
            // eslint-disable-next-line no-loop-func
            channelMessages.map((channelMessage, j) => {
              messageObject = channelMessage.message;
              messageObject.time = formatTimeToken(channelMessage.timetoken);
              messageObject.timetoken = channelMessage.timetoken;
              messageObject.actions = channelMessage.actions;
              messageObject.actionToken =
                channelMessage.actions &&
                channelMessage.actions.deleted &&
                channelMessage.actions.deleted["."][0].actionTimetoken;
              messageObject.text = getMessageText(channelMessage, messageObject);
              let channelMember = checkChannelMember(members[index]);
              if (channelMember === channelMessage.uuid) {
                messageObject.name = capitalizeFirstLetter(members[index].uuid.name);
                messageObject.profileUrl = members[index].uuid.profileUrl;
              }
              formatBannedMessage(messageObject);
              messagesSet = getMessageFileUrl(messageObject, channelMessage, pubnub, channelID);
              messagesList.push(messagesSet);
              return false;
            });
          }
        }

        setMessages([...new Set(messagesList)]);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    })();
  };

  /**
   * Handles message updates action (edit, delte, undo delete)
   */
  const messageUpdate = (messageToken, actionToken, action, updatedResponse) => {
    let filteredArray = messages.filter((item) => item.timetoken !== messageToken);
    let filteredMessage = messages.filter((row) => {
      return row.timetoken.includes(messageToken);
    });
    if (action) {
      if (action === "undo") filteredMessage[0].actions = "";
      if (action === "updated" && updatedResponse) {
        setMessageToEdit([]);
        filteredMessage[0].text = updatedResponse.value;
      } else if (action === "updated") {
        setMessageToEdit([]);
      }
    } else {
      filteredMessage[0].actions = "deleted";
      filteredMessage[0].actionToken = actionToken;
    }
    const messageIndex = messages.findIndex((row) => {
      return row.timetoken.includes(messageToken);
    });
    filteredArray.splice(messageIndex, 0, filteredMessage[0]);
    setMessages(filteredArray);
  };

  useEffect(() => {
    if (channelID) {
      pubnub.unsubscribeAll();
      pubnub.addListener({
        message: ({ ...receivedMessage }) => {
          let messageObject = {};
          let filterMember =
            members && members.filter((member) => member.uuid.id === receivedMessage.publisher);
          messageObject = receivedMessage.message;
          if (filterMember.length) {
            messageObject.name = filterMember[0].uuid.name;
            messageObject.profileUrl = filterMember[0].uuid.profileUrl;
          }
          if (
            messageObject.message &&
            messageObject.message.file &&
            messageObject.message.file.id &&
            messageObject.message.file.name &&
            !messageObject.message.file.url
          ) {
            const url = pubnub.getFileUrl({
              channel: channelID,
              id: messageObject.message.file.id,
              name: messageObject.message.file.name,
            });
            messageObject.file.url = url;
          }
          messageObject.time = formatTimeToken(receivedMessage.timetoken);
          messageObject.timetoken = receivedMessage.timetoken;
          setMessages((oldArray) => [...oldArray, messageObject]);
        },
      });
      pubnub.subscribe({ channels: [channelID] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const handleMemberDetails = (memberData) => {
    setMemberDetails(memberData);
    setToggleMemberDetails(true);
  };

  return (
    <>
      <Helmet title="Messages" />
      <Grid justify="space-between" container spacing={1}>
        <Grid item sm={9}>
          <Grid justify="space-between" container>
            <Grid item sm={12} className={classes.header}>
              <Grid justify="flex-start" container>
                <Box mr={1}>
                  <Avatar className={classes.avatar} variant="square">
                    {capitalizeNameInitials(location.state.channel)}
                  </Avatar>
                </Box>
                <Grid item sm={8} xs={12} md={8}>
                  {toggledVal === "chat" && (
                    <small className={classes.values}>
                      {location.state.channel} ({channel.name})
                    </small>
                  )}
                  {toggledVal === "banned" && (
                    <small className={classes.values}>
                      {location.state.channel} - Banned ({channel.name})
                    </small>
                  )}
                  <br />
                  <small className={classes.appName}>
                    {truncateChannelDescription(channel.description)}
                  </small>
                </Grid>
                <Grid item sm={3} md={3} lg={3}>
                  <Grid justify="space-between" container>
                    <Grid item />
                    <Grid item>
                      <Box mt={1}>
                        <ToggleChat toggledVal={toggledVal} setToggledVal={setToggledVal} />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              {toggledVal === "chat" && (
                <Box mt={1}>
                  <Grid justify="center" container>
                    <Button disabled className={classes.messagesCount}>
                      <MessagesCount channelName={location.state.channel} pubnub={pubnub} />
                    </Button>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
          <Grid item sm={12}>
            <Chat
              messages={messages}
              isLoading={loading}
              pubnub={pubnub}
              channel={location.state.channel}
              updated={messageUpdate}
              messageToEdit={messageToEdit}
              setMessageToEdit={setMessageToEdit}
              toggledVal={toggledVal}
            />
          </Grid>
        </Grid>
        <Grid item sm={3} className={classes.channelMembers}>
          {!toggleMemberDetails && (
            <Members
              channelMembers={members}
              pubnub={pubnub}
              selectedMemberDetail={(details) => handleMemberDetails(details)}
              channelName={location.state.channel}
              totalCount={totalCount}
              page={page}
            />
          )}
          {toggleMemberDetails && (
            <MemberDetail
              toggleMemberDetails={(toggleValue) => setToggleMemberDetails(toggleValue)}
              member={memberDetails}
              pubnub={pubnub}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default Messages;
