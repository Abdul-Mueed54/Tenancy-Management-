import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'

const settings = () => {
  const [username, setUsername] = useState("")
  const [repoName, setReponame] = useState("")
  const fetchRepo = () => {
    console.log(username)
    fetch(`https://api.github.com/users/${username}/repos`)
    .then(response => response.json())
    .then(data => setReponame(data[1].name))
  }
  return (
    <View style= {styles.container}>
      <Text>settings</Text>
      <TextInput
      value= {username}
      onChangeText={setUsername}
      style= {styles.input}
      placeholder='enter something'
      />
      <Button
      title='Fetch Repos'
      onPress= {fetchRepo}
      >
      </Button>
      <Text
      style= {styles.repoName}
      >Random Repo: {repoName}</Text>
    </View>
  )
}

export default settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  input: {
    backgroundColor: "white",
    width: "80%",
    height: 40,
    margin: 20,
    padding: 20,
    borderRadius: 5,
    borderWidth: 1,
  },
  repoName: {
    fontSize: 20,
    color: "black",
    margin: 10,
  }
})