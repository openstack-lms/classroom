## TODO for main app

- [ ] Replace file upload with existing API

### FEAT
- [ ] class scheduling + organization
    - [x] attendance, events page in class
    - [ ] organization level (sysadmin) scheduling (+ register interface sysadmin)
- [ ] add grades page teacher view (edit weighting and individual students grades) + allow adding extra credits

### REFACTOR
- [ ] API validation + data cleaning
- [ ] API response recieving helper function for everything

### BUGS
- [x] multiple day scheduling (handle on frontend) 

### FOR LATER 1.0.0-beta
- [ ] sockets
- [ ] assignment types
- [ ] ai integration
 - hugginface transformer fine tuning
- [ ] better search algo (overall) function for everything (members, classes, etc.)
- [ ] section typing (number or string) for Class
- [ ] input type = section css
- [ ] sorting for assignments
- [ ] extra: add markscheme / boundaries
- [ ] extra: make it look nicer 🥹
- [ ] general file handling
    - [ ] thumbnail generation + preview
        - [ ] images
        - [ ] videos
        - [ ] text files
        - [ ] pdfs / .docx etc
    - [ ] file upload validation
    - [ ] file upload queing
- [ ] class files
     - [ ] use API
     
### FINISHED
- [x] submissions not lined up with assignments `@ GET /api/class/[classId]` (line up two arrays)
- [x] seperate theme context to be prerendered before loading screen @note: fixed w/ other methods...
- [x] make api consistent
    - [x] remove `interfaces/classes` and `interfaces/index.ts`
    - [x] select for `/api/class/[classId]/route.ts`
    - [x] move `PUT /api/assignment` to `PUT /api/.../assignment/[assignmentId]`
    - [x] move `DELETE /api/assignment` to `DELETE /api/.../assignment/[assignmentId]`
    - [x] add better type safety
- [x] make `/forms` seperate from modal
- [x] grading system
    - [x] class creation UI
    - [x] class editing UI
    - [x] student UI
    - [x] add grading system api
    - [x] student view grades page
- [x] agenda (timetable)
    - [x] (refactor) typing
    - [x] editing and deleting events
    - [x] class events
- [x] labels look nicer (CSS)
- [x] announcements
    - [x] CRUD UI
    - [x] apis
- [x] deleting classes