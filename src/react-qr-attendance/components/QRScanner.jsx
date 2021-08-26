import React, { useState, useEffect } from 'react'
import QrReader from 'react-qr-reader'
import { Container } from 'react-bootstrap'
import { useAuth } from '../Context'
import { database } from '../Firebase'
import qrImg from '../pics/qrImg.png'
import NavBar from './NavBar'

export default function QRScanner() {
  const [result, setResult] = useState("")
  const [delay, setDelay] = useState(100)
  const [course, setCourse] = useState("")
  const [instructor, setInstructor] = useState("")
  const [attendanceAt, setAttendanceAt] = useState("")
  const [attendance, setAttendance] = useState(false)
  const { currentUser } = useAuth()
  function handleError(err){
    console.error(err)
  }
  function handleScan(data){
    let result = JSON.parse(data)
    if(data){
      console.log(result.date)
      setAttendanceAt(result.date)
      setResult(result.uniqueCode)
      setCourse(result.course)
      setInstructor(result.instructor)
      setDelay(false)
    } 
  }
  useEffect(() => {
    if(course){
      return () => {
        database.courseDetails
        .where('attendanceAt', '==', attendanceAt)
        .where('instructor', '==', instructor)
        .where('course', '==', course)
        .onSnapshot(snapshot => {
          snapshot.forEach(value => {
            if(value.data().uniqueCode === result){
              setAttendance(true)
              database.attendance
              .doc(`${attendanceAt}-${course}`)
              .collection(attendanceAt)
              .doc(currentUser.email)
              .set({
                course,
                instructor,
                studentEmail: currentUser.email,
                studentName:  currentUser.displayName
              })
            }
          })
        })
      }
    }
  }, [result, course, attendanceAt, instructor, delay, currentUser.email, currentUser.name])
  return(
    <Container className="main row p-0 m-0" style={{height: "100vh"}} fluid>
      <Container style={{height: "60vh",width: "100vw", background: "#2c2f40"}} className="main p-0 m-0">
        <NavBar/>
        <QrReader
          style={{width: "40vh", height: "30vh"}}
          delay={delay}
          onError={handleError}
          onScan={handleScan}
          className="some"
          />
      </Container>
      <Container fluid style={{height: "40vh", width: "100vw"}} className="main p-0 m-0 justify-content-evenly">
        <div><img style={{height: "39vh"}} src={qrImg} alt="qrImg"/></div>
        <div className="heading"><div className="react-heading">React</div> QR Attendance</div>
      </Container>
    </Container>
  )
}