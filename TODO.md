# OpenStack LMS Development Roadmap

## Core Features in Development

### Class Management & Organization
- [ ] Organization-level scheduling system
  - [ ] Implement sysadmin interface
  - [ ] Add institution-wide event management
- [ ] Enhanced grading system
  - [ ] Teacher dashboard for grade weighting
  - [ ] Individual student grade management
  - [ ] Extra credit implementation

### API Improvements
- [ ] Implement comprehensive API validation
- [ ] Standardize data cleaning processes
- [ ] Create unified API response handler
- [ ] Replace current file upload with existing API
- [ ] Improve search algorithm for global entities
  - [ ] Members search optimization
  - [ ] Classes search enhancement
  - [ ] Resources search implementation

### File System Enhancement
- [ ] Implement advanced file handling system
  - [ ] Smart thumbnail generation
    - [ ] Image processing and optimization
    - [ ] Video thumbnail extraction
    - [ ] Text file preview generation
    - [ ] PDF and Office document preview
  - [ ] File upload improvements
    - [ ] Validation system
    - [ ] Queue management
    - [ ] Progress tracking
- [ ] Class files system integration
  - [ ] API integration
  - [ ] File organization structure

## 1.0.0-beta Features

### AI Integration
- [ ] Implement Hugging Face transformer integration
  - [ ] Model fine-tuning for educational context
  - [ ] Learning assistance features
  - [ ] Content recommendation system

### Real-time Features
- [ ] Socket implementation
  - [ ] Real-time notifications
  - [ ] Live collaboration features
  - [ ] Instant messaging

### Assignment System Improvements
- [ ] Implement assignment types categorization
- [ ] Add sorting capabilities
  - [ ] Due date sorting
  - [ ] Type-based sorting
  - [ ] Priority sorting
- [ ] Enhanced grading features
  - [ ] Markscheme implementation
  - [ ] Grade boundaries system
  - [ ] Rubric creation tools

### Technical Improvements
- [ ] Section typing optimization
  - [ ] Support for number and string types
  - [ ] Section-specific CSS implementations
- [ ] UI/UX Enhancement
  - [ ] Design system implementation
  - [ ] Accessibility improvements
  - [ ] Mobile responsiveness optimization

## Notes
- Priority levels will be assigned based on team capacity and user feedback
- Features may be reorganized based on development sprints
- Regular updates to this roadmap will be made as requirements evolve

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