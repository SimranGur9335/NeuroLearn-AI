# Route Duplication Audit Report

This report documents route duplication in `backend/main.py` where multiple routing decorators are stacked on the same handler function. This leads to duplicate endpoints in the OpenAPI documentation, potential route collision, security inconsistency, and structural clutter.

## Summary

- **Total Functions with Stacked Routes**: 79
- **Total Registered Routes from Duplication**: 162

## Duplicate Routes Registry

| Line No. | Function | Duplicate Routes (Decorators) |
| --- | --- | --- |
| 1362 | `get_faculty_classes` | `GET /api/faculty/{faculty_id}/classes` (Line 1360), `GET /faculty/{faculty_id}/classes` (Line 1361) |
| 1393 | `get_class_students` | `GET /api/class/{class_id}/students` (Line 1391), `GET /class/{class_id}/students` (Line 1392) |
| 1450 | `get_class_student_metrics` | `GET /api/class/{class_id}/student-metrics` (Line 1448), `GET /class/{class_id}/student-metrics` (Line 1449) |
| 1524 | `get_dashboard_summary` | `GET /api/class/{class_id}/dashboard-summary` (Line 1522), `GET /class/{class_id}/dashboard-summary` (Line 1523) |
| 1577 | `get_class_attendance` | `GET /api/class/{class_id}/attendance` (Line 1575), `GET /class/{class_id}/attendance` (Line 1576) |
| 1641 | `get_attendance_summary` | `GET /api/class/{class_id}/attendance-summary` (Line 1639), `GET /class/{class_id}/attendance-summary` (Line 1640) |
| 1682 | `get_student_attendance_history` | `GET /api/student/{student_id}/attendance-history` (Line 1680), `GET /student/{student_id}/attendance-history` (Line 1681) |
| 1703 | `mark_attendance` | `POST /api/attendance/mark` (Line 1701), `POST /attendance/mark` (Line 1702) |
| 1762 | `get_attendance_registry` | `GET /api/class/{class_id}/attendance-registry` (Line 1760), `GET /class/{class_id}/attendance-registry` (Line 1761) |
| 1812 | `get_today_attendance` | `GET /api/class/{class_id}/today-attendance` (Line 1810), `GET /class/{class_id}/today-attendance` (Line 1811) |
| 1870 | `get_student_profile` | `GET /api/students/{student_id}` (Line 1868), `GET /students/{student_id}` (Line 1869) |
| 1939 | `update_student` | `PUT /api/students/{student_id}` (Line 1937), `PUT /students/{student_id}` (Line 1938) |
| 1963 | `delete_student` | `DELETE /api/students/{student_id}` (Line 1961), `DELETE /students/{student_id}` (Line 1962) |
| 2000 | `get_faculty` | `GET /api/faculty` (Line 1998), `GET /faculty` (Line 1999) |
| 2023 | `get_faculty_profile` | `GET /api/faculty/{faculty_id}` (Line 2021), `GET /faculty/{faculty_id}` (Line 2022) |
| 2110 | `update_faculty` | `PUT /api/faculty/{faculty_id}` (Line 2108), `PUT /faculty/{faculty_id}` (Line 2109) |
| 2142 | `delete_faculty` | `DELETE /api/faculty/{faculty_id}` (Line 2140), `DELETE /faculty/{faculty_id}` (Line 2141) |
| 2287 | `update_mapping` | `PUT /api/faculty-mapping/{mapping_id}` (Line 2285), `PUT /faculty-mapping/{mapping_id}` (Line 2286) |
| 2352 | `delete_mapping` | `DELETE /api/faculty-mapping/{mapping_id}` (Line 2350), `DELETE /faculty-mapping/{mapping_id}` (Line 2351) |
| 2430 | `update_course` | `PUT /api/courses/{course_id}` (Line 2428), `PUT /courses/{course_id}` (Line 2429) |
| 2462 | `delete_course` | `DELETE /api/courses/{course_id}` (Line 2460), `DELETE /courses/{course_id}` (Line 2461) |
| 2533 | `update_subject` | `PUT /api/subjects/{subject_id}` (Line 2531), `PUT /subjects/{subject_id}` (Line 2532) |
| 2565 | `delete_subject` | `DELETE /api/subjects/{subject_id}` (Line 2563), `DELETE /subjects/{subject_id}` (Line 2564) |
| 2637 | `update_class` | `PUT /api/classes/{class_id}` (Line 2635), `PUT /classes/{class_id}` (Line 2636) |
| 2669 | `delete_class` | `DELETE /api/classes/{class_id}` (Line 2667), `DELETE /classes/{class_id}` (Line 2668) |
| 2738 | `update_department` | `PUT /api/departments/{dept_id}` (Line 2736), `PUT /departments/{dept_id}` (Line 2737) |
| 2769 | `delete_department` | `DELETE /api/departments/{dept_id}` (Line 2767), `DELETE /departments/{dept_id}` (Line 2768) |
| 2965 | `transfer_enrollment` | `PUT /api/enrollments/{enrollment_id}` (Line 2963), `PUT /enrollments/{enrollment_id}` (Line 2964) |
| 3037 | `delete_enrollment` | `DELETE /api/enrollments/{enrollment_id}` (Line 3035), `DELETE /enrollments/{enrollment_id}` (Line 3036) |
| 3078 | `get_enrollment_history` | `GET /api/enrollments/history/{student_id}` (Line 3076), `GET /enrollments/history/{student_id}` (Line 3077) |
| 3203 | `delete_course_subject_mapping` | `DELETE /api/course-subject-mappings/{mapping_id}` (Line 3201), `DELETE /course-subject-mappings/{mapping_id}` (Line 3202) |
| 3464 | `get_announcements` | `GET /api/announcements` (Line 3461), `GET /announcements` (Line 3462), `GET /faculty/announcements` (Line 3463) |
| 3474 | `mark_announcement_as_read` | `POST /announcements/{announcement_id}/read` (Line 3471), `POST /faculty/announcements/{announcement_id}/read` (Line 3472), `POST /api/announcements/{announcement_id}/read` (Line 3473) |
| 3499 | `mark_all_announcements_as_read` | `POST /api/announcements/read-all` (Line 3496), `POST /announcements/read-all` (Line 3497), `POST /faculty/announcements/read-all` (Line 3498) |
| 3527 | `create_announcement` | `POST /api/announcements` (Line 3524), `POST /announcements` (Line 3525), `POST /faculty/announcements` (Line 3526) |
| 3543 | `update_announcement` | `PUT /api/announcements/{announcement_id}` (Line 3541), `PUT /announcements/{announcement_id}` (Line 3542) |
| 3562 | `delete_announcement` | `DELETE /api/announcements/{announcement_id}` (Line 3560), `DELETE /announcements/{announcement_id}` (Line 3561) |
| 3583 | `get_faculty_workload` | `GET /api/faculty/{faculty_id}/workload` (Line 3581), `GET /faculty/{faculty_id}/workload` (Line 3582) |
| 3645 | `get_audit_logs` | `GET /api/audit-logs` (Line 3643), `GET /audit-logs` (Line 3644) |
| 3682 | `get_admin_dashboard_stats` | `GET /api/admin/dashboard-stats` (Line 3680), `GET /admin/dashboard-stats` (Line 3681) |
| 3766 | `get_academic_terms` | `GET /api/academic-terms` (Line 3764), `GET /academic-terms` (Line 3765) |
| 3791 | `create_academic_term` | `POST /api/academic-terms` (Line 3789), `POST /academic-terms` (Line 3790) |
| 3824 | `update_academic_term` | `PUT /api/academic-terms/{term_id}` (Line 3822), `PUT /academic-terms/{term_id}` (Line 3823) |
| 3844 | `delete_academic_term` | `DELETE /api/academic-terms/{term_id}` (Line 3842), `DELETE /academic-terms/{term_id}` (Line 3843) |
| 3937 | `get_admin_settings` | `GET /api/admin/settings` (Line 3935), `GET /admin/settings` (Line 3936) |
| 3962 | `update_admin_settings` | `POST /api/admin/settings` (Line 3960), `POST /admin/settings` (Line 3961) |
| 5695 | `get_faculty_by_email` | `GET /api/faculty/by-email/{email}` (Line 5693), `GET /faculty/by-email/{email}` (Line 5694) |
| 5757 | `get_mapping_audit` | `GET /api/faculty/mapping-audit` (Line 5755), `GET /faculty/mapping-audit` (Line 5756) |
| 5844 | `get_attendance_records` | `GET /api/attendance/records` (Line 5842), `GET /attendance/records` (Line 5843) |
| 5887 | `save_attendance` | `POST /api/attendance/save` (Line 5885), `POST /attendance/save` (Line 5886) |
| 5953 | `get_attendance_history` | `GET /api/attendance/history` (Line 5951), `GET /attendance/history` (Line 5952) |
| 5989 | `get_monthly_attendance_report` | `GET /api/attendance/monthly-report` (Line 5987), `GET /attendance/monthly-report` (Line 5988) |
| 6049 | `get_faculty_students` | `GET /api/faculty/{faculty_id}/students` (Line 6047), `GET /faculty/{faculty_id}/students` (Line 6048) |
| 6099 | `update_student_intervention` | `POST /faculty/student/{student_id}/intervention` (Line 6097), `POST /api/v1/faculty/student/{student_id}/intervention` (Line 6098) |
| 6163 | `get_student_profile_v1` | `GET /api/student/{student_id}/profile` (Line 6160), `GET /student/{student_id}/profile` (Line 6161) |
| 6321 | `get_assignments` | `GET /api/assignments` (Line 6319), `GET /assignments` (Line 6320) |
| 6377 | `create_assignment` | `POST /api/assignments` (Line 6375), `POST /assignments` (Line 6376) |
| 6450 | `update_assignment` | `PUT /api/assignments/{assignment_id}` (Line 6448), `PUT /assignments/{assignment_id}` (Line 6449) |
| 6551 | `delete_assignment` | `DELETE /api/assignments/{assignment_id}` (Line 6549), `DELETE /assignments/{assignment_id}` (Line 6550) |
| 6578 | `close_assignment` | `POST /api/assignments/{assignment_id}/close` (Line 6576), `POST /assignments/{assignment_id}/close` (Line 6577) |
| 6622 | `reopen_assignment` | `POST /api/assignments/{assignment_id}/reopen` (Line 6620), `POST /assignments/{assignment_id}/reopen` (Line 6621) |
| 6666 | `get_assignment_submissions` | `GET /api/assignments/{assignment_id}/submissions` (Line 6664), `GET /assignments/{assignment_id}/submissions` (Line 6665) |
| 6712 | `grade_submission` | `POST /api/submissions/{submission_id}/grade` (Line 6710), `POST /submissions/{submission_id}/grade` (Line 6711) |
| 6778 | `submit_assignment` | `POST /api/assignments/{assignment_id}/submit` (Line 6776), `POST /assignments/{assignment_id}/submit` (Line 6777) |
| 6867 | `get_student_marks` | `GET /api/marks` (Line 6865), `GET /marks` (Line 6866) |
| 7024 | `save_student_marks_bulk` | `POST /api/marks/bulk-entry` (Line 7022), `POST /marks/bulk-entry` (Line 7023) |
| 7227 | `run_risk_engine` | `POST /api/faculty/run-risk-engine` (Line 7225), `POST /faculty/run-risk-engine` (Line 7226) |
| 7353 | `get_faculty_analytics` | `GET /api/faculty/{faculty_id}/analytics` (Line 7351), `GET /faculty/{faculty_id}/analytics` (Line 7352) |
| 9106 | `create_remedial_session` | `POST /api/remedial/sessions` (Line 9104), `POST /remedial/sessions` (Line 9105) |
| 9126 | `update_remedial_session` | `PUT /api/remedial/sessions/{session_id}` (Line 9124), `PUT /remedial/sessions/{session_id}` (Line 9125) |
| 9145 | `cancel_remedial_session` | `POST /api/remedial/sessions/{session_id}/cancel` (Line 9143), `POST /remedial/sessions/{session_id}/cancel` (Line 9144) |
| 9164 | `start_remedial_session` | `POST /api/remedial/sessions/{session_id}/start` (Line 9162), `POST /remedial/sessions/{session_id}/start` (Line 9163) |
| 9183 | `complete_remedial_session` | `POST /api/remedial/sessions/{session_id}/complete` (Line 9181), `POST /remedial/sessions/{session_id}/complete` (Line 9182) |
| 9202 | `get_remedial_sessions` | `GET /api/remedial/sessions` (Line 9200), `GET /remedial/sessions` (Line 9201) |
| 9251 | `get_session_invitations` | `GET /api/remedial/sessions/{session_id}/invitations` (Line 9249), `GET /remedial/sessions/{session_id}/invitations` (Line 9250) |
| 9278 | `update_invitation_status` | `POST /api/remedial/invitations/{invitation_id}/status` (Line 9276), `POST /remedial/invitations/{invitation_id}/status` (Line 9277) |
| 10513 | `get_domains` | `GET /api/domains` (Line 10511), `GET /api/v1/domains` (Line 10512) |
| 10555 | `get_domain_detail` | `GET /api/domains/{domain_key}` (Line 10553), `GET /api/v1/domains/{domain_key}` (Line 10554) |
| 10597 | `submit_quiz_score` | `POST /api/quiz/submit` (Line 10595), `POST /api/v1/quiz/submit` (Line 10596) |

## Analysis of Duplication Patterns

1. **Legacy Prefix vs. API Prefix**:
   Many routes have a stacked pair where one route begins with `/api` or `/api/v1` and the other is a direct root path (e.g. `/api/students/{student_id}` vs. `/students/{student_id}`). This was likely introduced to support older frontend clients while transitioning to a standard api prefix.

2. **Version Prefix Duplication**:
   Some newer routes stack `/api/...` and `/api/v1/...` (e.g. `/api/domains` vs `/api/v1/domains`), showing inconsistency in api versioning patterns.

3. **Security Constraints Stack**:
   Some duplicates also exist on routes with complex dependencies (like `Depends(require_role(...))`), risking security gaps if access rules change.
