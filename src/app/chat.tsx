// src/app/chat.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Chat() {
  const router = useRouter();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello, is this the 138 bus to Piassa?', isUser: true },
    { id: '2', text: 'Yes! I am approaching the Bole Airport terminal in 3 minutes.', isUser: false },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: chatInput, isUser: true }]);
    setChatInput('');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{fontSize: 20}}>⬅️</Text>
        </TouchableOpacity>
        <View style={{marginLeft: 16}}>
          <Text style={styles.chatDriverName}>Driver: Abebe Kebede</Text>
          <Text style={styles.chatDriverSub}>Active Duty • Route 12</Text>
        </View>
      </View>
      
      <ScrollView style={styles.chatMessageScroll} contentContainerStyle={{padding: 16}}>
        {messages.map(msg => (
          <View key={msg.id} style={[
            styles.messageContainer,
            msg.isUser ? styles.messageUser : styles.messageDriver
          ]}>
            <Text style={[styles.messageText, msg.isUser ? {color: '#FFF'} : {color: '#1F2937'}]}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput style={styles.chatInputText} placeholder="Type message..." value={chatInput} onChangeText={setChatInput} />
        <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
          <Text style={{color: '#FFF', fontWeight: 'bold'}}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingTop: 40 },
  chatDriverName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  chatDriverSub: { fontSize: 11, color: '#10B981', fontWeight: '500' },
  chatMessageScroll: { flex: 1, backgroundColor: '#F9FAFB' },
  messageContainer: { maxWidth: '75%', padding: 12, borderRadius: 12, marginBottom: 12 },
  messageUser: { alignSelf: 'flex-end', backgroundColor: '#2F80ED', borderBottomRightRadius: 0 },
  messageDriver: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderBottomLeftRadius: 0 },
  messageText: { fontSize: 13, lineHeight: 18 },
  chatInputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' },
  chatInputText: { flex: 1, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, fontSize: 13, color: '#1F2937' },
  chatSendBtn: { backgroundColor: '#2F80ED', paddingHorizontal: 16, height: 40, borderRadius: 20, marginLeft: 12, justifyContent: 'center', alignItems: 'center' }
});