// src/app/chat.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

interface Message {
  id: string;
  sender: string;
  text: string;
  isUser: boolean; // true if sent by the driver
  timestamp: string;
}

export default function Chat() {
  const router = useRouter();

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Active channel state
  const [activeTab, setActiveTab] = useState<'dispatch' | 'passengers'>('dispatch');
  const [chatInput, setChatInput] = useState('');

  // Dispatch Messages State
  const [dispatchMessages, setDispatchMessages] = useState<Message[]>([
    { id: 'd1', sender: 'Dispatch (Kapila)', text: 'Route 138 status check. Are you experiencing delays near Maharagama junction?', isUser: false, timestamp: '10:14 AM' },
    { id: 'd2', sender: 'Driver (You)', text: 'Maharagama junction is clear. Moving smoothly towards Nugegoda now.', isUser: true, timestamp: '10:15 AM' },
    { id: 'd3', sender: 'Dispatch (Ruwan)', text: 'Copy that. High Level Road has minor congestion, keep headway spacing.', isUser: false, timestamp: '10:17 AM' },
  ]);

  // Passengers Feed Messages State
  const [passengerMessages, setPassengerMessages] = useState<Message[]>([
    { id: 'p1', sender: 'Rider (Kasun)', text: 'Hello driver, is this bus stopping at Pettah terminal?', isUser: false, timestamp: '10:09 AM' },
    { id: 'p2', sender: 'Driver (You)', text: 'Yes, Pettah is the final stop on Route 138.', isUser: true, timestamp: '10:11 AM' },
    { id: 'p3', sender: 'Rider (Sanduni)', text: 'Excuse me, I think I left my red pouch on one of the back seats.', isUser: false, timestamp: '10:20 AM' },
  ]);

  const activeMessages = activeTab === 'dispatch' ? dispatchMessages : passengerMessages;

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = {
      id: `msg-${dispatchMessages.length + passengerMessages.length + 1}`,
      sender: 'Driver (You)',
      text: textToSend,
      isUser: true,
      timestamp: time,
    };

    if (activeTab === 'dispatch') {
      setDispatchMessages((prev) => [...prev, newMessage]);
    } else {
      setPassengerMessages((prev) => [...prev, newMessage]);
    }

    setChatInput('');
  };

  // Quick replies for safe driving interaction
  const quickReplies = [
    '👍 Copy That',
    '🚧 Traffic Delay',
    '🚨 Breakdown Alert',
    '⏱️ Arriving in 2m',
    '✅ Clear Road',
  ];

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeContainer, themeStyles.bg]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.topHeader, themeStyles.cardBg, themeStyles.headerBorder]}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backIcon, themeStyles.text]}>⬅️</Text>
            </TouchableOpacity>
            <View style={styles.titleWrapper}>
              <Text style={[styles.screenHeading, themeStyles.text]}>Comms Hub</Text>
              <Text style={styles.screenSubtitle}>Dispatch & Rider Operations</Text>
            </View>
            <TouchableOpacity 
              style={[styles.themeToggle, themeStyles.toggleBg]} 
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'dispatch' && styles.tabActive]}
              onPress={() => setActiveTab('dispatch')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'dispatch' ? styles.tabTextActive : themeStyles.textSec
              ]}>
                📡 Dispatch Center
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'passengers' && styles.tabActive]}
              onPress={() => setActiveTab('passengers')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'passengers' ? styles.tabTextActive : themeStyles.textSec
              ]}>
                👥 Passenger Feed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Messages list */}
        <ScrollView 
          style={themeStyles.bg} 
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ref={(ref) => ref?.scrollToEnd({ animated: true })}
        >
          {activeMessages.map((msg) => (
            <View key={msg.id} style={[
              styles.messageBlock,
              msg.isUser ? styles.messageBlockUser : styles.messageBlockOther
            ]}>
              <View style={[
                styles.messageContainer,
                msg.isUser ? styles.messageUser : themeStyles.messageOtherCard,
                msg.isUser ? styles.userBorderRadius : styles.otherBorderRadius,
              ]}>
                {!msg.isUser && (
                  <Text style={styles.senderLabel}>{msg.sender}</Text>
                )}
                <Text style={[
                  styles.messageText,
                  msg.isUser ? { color: '#FFF' } : themeStyles.text
                ]}>
                  {msg.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  msg.isUser ? { color: '#D2E3FC' } : themeStyles.textSec
                ]}>
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Quick replies keyboard overlay */}
        <View style={[styles.bottomControlArea, themeStyles.cardBg, themeStyles.headerBorder]}>
          <Text style={[styles.controlLabel, themeStyles.textSec]}>🚨 ONE-TAP QUICK REPLY (DRIVING SAFETY)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesScroll}>
            {quickReplies.map((reply) => (
              <TouchableOpacity
                key={reply}
                style={[styles.quickReplyPill, themeStyles.toggleBg]}
                onPress={() => handleSendMessage(reply)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickReplyText, themeStyles.text]}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Typing input */}
          <View style={styles.chatInputRow}>
            <TextInput 
              style={[styles.chatInputText, themeStyles.inputBg, themeStyles.text]} 
              placeholder="Type message..." 
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={chatInput} 
              onChangeText={setChatInput} 
            />
            <TouchableOpacity 
              style={styles.chatSendBtn} 
              onPress={() => handleSendMessage(chatInput)}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Themes
const lightTheme = StyleSheet.create({
  bg: { backgroundColor: '#F9FAFB' },
  cardBg: { backgroundColor: '#FFFFFF' },
  toggleBg: { backgroundColor: '#F3F4F6' },
  headerBorder: { borderBottomColor: '#E5E7EB', borderTopColor: '#E5E7EB' },
  messageOtherCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  text: { color: '#1F2937' },
  textSec: { color: '#6B7280' },
  inputBg: { backgroundColor: '#F3F4F6' },
});

const darkTheme = StyleSheet.create({
  bg: { backgroundColor: '#111827' },
  cardBg: { backgroundColor: '#1F2937' },
  toggleBg: { backgroundColor: '#374151' },
  headerBorder: { borderBottomColor: '#374151', borderTopColor: '#374151' },
  messageOtherCard: { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' },
  text: { color: '#F9FAFB' },
  textSec: { color: '#9CA3AF' },
  inputBg: { backgroundColor: '#111827' },
});

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  backIcon: {
    fontSize: 18,
  },
  titleWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  screenHeading: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 6,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#E8F0FE',
    borderColor: '#2F80ED',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#2F80ED',
  },
  messageBlock: {
    width: '100%',
    marginBottom: 12,
  },
  messageBlockUser: {
    alignItems: 'flex-end',
  },
  messageBlockOther: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageUser: {
    backgroundColor: '#2F80ED',
  },
  userBorderRadius: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 0,
  },
  otherBorderRadius: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
  },
  senderLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2F80ED',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  bottomControlArea: {
    padding: 12,
    borderTopWidth: 1,
  },
  controlLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quickRepliesScroll: {
    gap: 6,
    paddingBottom: 12,
  },
  quickReplyPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  quickReplyText: {
    fontSize: 11,
    fontWeight: '800',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInputText: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  chatSendBtn: {
    backgroundColor: '#2F80ED',
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});