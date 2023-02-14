const fs = require('fs')
const express = require('express')

const path = require('path')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const dbPath = path.join(process.cwd(), 'db.json')
const levelPath = path.join(process.cwd(), 'level.json')

const readRecordJSONData = () => {
    return JSON.parse(fs.readFileSync(dbPath))
}

const readLevelJSONData = () => {
    return JSON.parse(fs.readFileSync(levelPath))
}

app.get('/getUserPoint/:id', function(req, res) {
    let readCache = readRecordJSONData()
    readCache.forEach((user) => {
        if (user.id === req.params.id) {
            res.send(user)
        }
    })
})

app.post('/addUserPoints', function(req, res) {
    let readCache = readRecordJSONData()
    let scannedUser
    readCache.forEach((user, index) => {
        if (user.id === req.body.data.id) {
            readCache[index].points += 1
            scannedUser = user
        }
    })
    fs.writeFile(dbPath, JSON.stringify(readCache), (error) => {
        if (error) {
            res.send(error);
            return;
        }
        res.send(scannedUser);
    });
})

app.get('/getUsersByEntity/:entity/:value', function(req, res) {
    let readCache = readRecordJSONData()
    res.send(readCache.filter((user) => {
        return user[req.params.entity] === req.params.value
    }))
})

app.get('/getLevels', function(req, res) {
    let readCache = readLevelJSONData()
    res.send(readCache)
})

app.post('/saveData', function(req, res) {
    let readCache = readRecordJSONData()
    readCache.push(req.body.data)
    fs.writeFile(dbPath, JSON.stringify(readCache), (error) => {
        if (error) {
            res.send(error);
            return;
        }
        res.send('data saved successfully');
    });
})

app.post('/saveEditData', function(req, res) {
    let readCache = readRecordJSONData()
    readCache.forEach((record, index) => {
        if (record.id === req.body.data.id) {
            readCache[index] = req.body.data
        }
    })
    fs.writeFile(dbPath, JSON.stringify(readCache), (error) => {
        if (error) {
            res.send(error);
            return;
        }
        res.send('data Updated successfully');
    });
})

app.delete('/deleteRecord/:id', function(req, res) {
    let readCache = readRecordJSONData()
    readCache = readCache.filter((record) => {
        return record.id !== req.params.id
    })
    fs.writeFile(dbPath, JSON.stringify(readCache), (error) => {
        if (error) {
            res.send(error);
            return;
        }
        res.send('data deleted successfully');
    });
})

app.get('/getDataCount', function(req, res) {
    let readCache = readRecordJSONData()
    res.send(readCache)
})

app.post('/levelsAdd/:key', function(req, res) {
    let readCache = readLevelJSONData()
    if (req.params.key === 'grade') {
        readCache.push({
            grade: req.body.grade,
            sections: []
        })
    } else if (req.params.key === 'section') {
        readCache.forEach((grade, index) => {
            if (grade.grade === req.body.grade) {
                readCache[index].sections.push({
                    section: req.body.section,
                    groups: []
                })
            }
        })
    } else if (req.params.key === 'group') {
        readCache.forEach((grade, index) => {
            if (grade.grade === req.body.grade) {
                readCache[index].sections.forEach((section, index2) => {
                    if (section.section === req.body.section) {
                        readCache[index].sections[index2].groups.push(req.body.group)
                    }
                })
            }
        })
    }
    fs.writeFile(levelPath, JSON.stringify(readCache), (error) => {
        if (error) {
            res.send(error);
            return;
        }
        res.send('level data added successfully');
    });
})

app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`)
})