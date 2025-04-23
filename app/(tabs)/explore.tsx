import { View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import tw from 'twrnc';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

const explore = () => {
  const [tugas, setTugas] = useState('');
  const [daftar, setDaftar] = useState<{ id: string; tugas: string; mapel: string; tanggal: string; checkbox: boolean }[]>([]);
  const [mapel, setMapel] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  const tambahTugas = () => {
    if (tugas.trim() === '' || mapel.trim() === '') return;

    const newTask = {
      id: Date.now().toString(),
      tugas: tugas.trim(),
      mapel: mapel.trim(),
      tanggal: date.toISOString().split('T')[0], // ✅ Simpan format ISO
      checkbox: false,
    };

    setDaftar([...daftar, newTask]);
    setTugas('');
    setMapel('');
  };

  const saveTugas = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(daftar));
    } catch (error) {
      console.log('Gagal menyimpan data');
    }
  };

  const loadTugas = async () => {
    try {
      const tugas = await AsyncStorage.getItem('tasks');
      if (tugas !== null) {
        setDaftar(JSON.parse(tugas));
      }
    } catch (error) {
      console.log('Gagal memuat data');
    }
  };

  useEffect(() => {
    loadTugas();
  }, []);

  useEffect(() => {
    saveTugas();
  }, [daftar]);

  const deleteTugas = (id: string) => {
    const filtered = daftar.filter((item) => item.id !== id);
    setDaftar(filtered);
  };

  const editTugas = (id: string) => {
    const taskToEdit = daftar.find((item) => item.id === id);
    if (taskToEdit) {
      setTugas(taskToEdit.tugas);
      setMapel(taskToEdit.mapel);

      const parsedDate = new Date(taskToEdit.tanggal);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
      } else {
        console.warn('Tanggal tidak valid:', taskToEdit.tanggal);
      }

      setIsEditing(true);
      setEditId(id);
    }
  };

  const updateTugas = () => {
    const updated = daftar.map((item) =>
      item.id === editId
        ? { ...item, tugas: tugas.trim(), mapel: mapel.trim(), tanggal: date.toISOString().split('T')[0] }
        : item
    );
    setDaftar(updated);
    setTugas('');
    setMapel('');
    setIsEditing(false);
    setEditId('');
  };

  const handleCheckbox = (id: string) => {
    const updated = daftar.map((item) =>
      item.id === id ? { ...item, checkbox: !item.checkbox } : item
    );
    setDaftar(updated);
  };

  return (
    <SafeAreaView style={tw`p-4`}>
      <ScrollView>
        <Text style={tw`text-2xl font-bold mb-2`}>Tugas</Text>

        <View style={tw`justify-between items-center`}>
          <TextInput
            style={tw`bg-gray-200 rounded-lg px-4 py-3 mr-2 w-80`}
            placeholder="Mau ngapain hari ini?"
            placeholderTextColor="gray"
            value={tugas}
            onChangeText={setTugas}
          />

          <TextInput
            style={tw`bg-gray-200 rounded-lg px-4 py-3 mr-2 w-80 mt-4`}
            placeholder="Mapel apa tu?"
            placeholderTextColor="gray"
            value={mapel}
            onChangeText={setMapel}
          />

          <View style={tw`mt-4`}>
            <View style={tw`flex-row items-center`}>
              <TextInput
                style={tw`bg-gray-200 rounded-lg px-4 py-3 mr-2 w-65`}
                placeholder="Pilih tanggal"
                value={date.toLocaleDateString('id-ID')}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowCalendar(true)}>
                <View style={tw`bg-blue-800 rounded-lg p-3`}>
                  <Ionicons name="calendar-outline" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            {showCalendar && (
              <Modal
                transparent={true}
                visible={showCalendar}
                onRequestClose={() => setShowCalendar(false)}
              >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                  <View style={tw`bg-white p-4 rounded-lg w-80`}>
                    <Calendar
                      onDayPress={(day:any) => {
                        setDate(new Date(day.dateString));
                        setShowCalendar(false);
                      }}
                      markedDates={{
                        [date.toISOString().split('T')[0]]: {
                          selected: true,
                          marked: true,
                          selectedColor: 'blue',
                        },
                      }}
                      theme={{
                        selectedDayBackgroundColor: '#1e3a8a',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#1e3a8a',
                        arrowColor: '#1e3a8a',
                      }}
                    />
                  </View>
                </View>
              </Modal>
            )}
          </View>

          <TouchableOpacity
            style={tw`bg-blue-900 px-4 py-2 rounded-lg mt-4 w-70`}
            onPress={isEditing ? updateTugas : tambahTugas}
          >
            <Text style={tw`text-white text-center font-bold`}>
              {isEditing ? 'Update Tugas' : 'Tambah Tugas'}
            </Text>
          </TouchableOpacity>
        </View>

        {daftar.length > 0 && <Text style={tw`mt-4 text-gray-500 text-lg font-bold`}>Tugas kamu</Text>}

        {daftar.length === 0 ? (
          <Text style={tw`text-center mt-4 text-gray-500 text-lg font-bold`}>YEY GA ADA TUGAS!</Text>
        ) : (
          <FlatList
            data={daftar}
            keyExtractor={(tugases) => tugases.id}
            renderItem={({ item: tugases }) => (
              <View style={tw`flex-row justify-between items-center bg-white p-4 rounded-lg mb-3 shadow-md mt-4`}>
                <TouchableOpacity onPress={() => handleCheckbox(tugases.id)}>
                  <Ionicons
                    name={tugases.checkbox ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={tugases.checkbox ? 'green' : 'gray'}
                  />
                </TouchableOpacity>

                <View style={tw`flex-1 ml-3`}>
                  <Text style={tw`font-bold text-lg text-blue-800 mb-1`}>{tugases.tugas}</Text>
                  <Text style={tw`text-gray-600 text-sm`}>{tugases.mapel}</Text>
                  <Text style={tw`text-red-500 text-sm`}>
                    {new Date(tugases.tanggal).toLocaleDateString('id-ID')}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => editTugas(tugases.id)}>
                  <AntDesign name="edit" size={24} color="blue" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={tw`bg-red-500 px-3 py-1 rounded-lg`}
                  onPress={() =>
                    Alert.alert('Hapus Tugas', 'Apakah kamu yakin ingin menghapus tugas ini?', [
                      {
                        text: 'Batal',
                        style: 'cancel',
                      },
                      {
                        text: 'Hapus',
                        onPress: () => deleteTugas(tugases.id),
                      },
                    ])
                  }
                >
                  <Ionicons name="trash" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default explore;
