import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        animationValue: new Animated.Value(0) // Animation value for new task
      };

      // Trigger animation for new task
      Animated.timing(newTask.animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();

      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    // Find the task that will be deleted and trigger the fade-out animation
    const taskToDelete = tasks.find(item => item.id === taskId);

    if (taskToDelete) {
      Animated.timing(taskToDelete.animationValue, {
        toValue: 0, // Fade out
        duration: 500,
        useNativeDriver: true
      }).start(() => {
        // After the fade-out, delete the task
        setTasks(tasks.filter((item) => item.id !== taskId));
      });
    }
  };

  const toggleCompletion = (taskId) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const editTask = (taskId, currentText) => {
    setEditingTaskId(taskId);
  };

  const updateTask = (taskId, newText) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, text: newText } : item
      )
    );
    setEditingTaskId(null);
  };

  const saveTasks = async () => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  };

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('tasks');
      if (jsonValue != null) {
        setTasks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.taskContainer,
              { opacity: item.animationValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) } // Animation applied here
            ]}
          >
            {editingTaskId === item.id ? (
              <TextInput
                style={styles.input}
                value={item.text}
                onChangeText={(newText) => {
                  setTasks(
                    tasks.map((task) =>
                      task.id === item.id ? { ...task, text: newText } : task
                    )
                  );
                }}
                autoFocus
              />
            ) : (
              <Text
                style={[styles.taskText, item.completed && styles.completedTaskText]}
                onPress={() => editTask(item.id, item.text)}
              >
                {item.text}
              </Text>
            )}
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => toggleCompletion(item.id)}
            >
              <Text style={styles.completeButtonText}>
                {item.completed ? 'Undo' : 'Complete'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>X</Text>
            </TouchableOpacity>
            {editingTaskId === item.id && (
              <TouchableOpacity
                onPress={() => updateTask(item.id, item.text)}
                style={styles.saveButtonContainer}
              >
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  completeButton: {
    backgroundColor: '#5C5CFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  saveButtonContainer: {
    marginLeft: 10,
  },
  saveButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
