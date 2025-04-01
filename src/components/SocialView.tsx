// SocialView.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Heading from "@atlaskit/heading";
import Button from "@atlaskit/button/standard-button";
import Form, {
  Field,
  FormHeader,
  FormSection,
  FormFooter,
} from "@atlaskit/form";
import Select from "@atlaskit/select";
import { Box } from "@atlaskit/primitives";

// Interfaces de datos
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  run: string;
  eneatype: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  eneatype?: string;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  studentIds: string[]; // Array de IDs
}

interface SocialSurveyResponse {
  id: string;
  studentId: string;
  courseId: string;
  isCompleted: boolean;
}

interface CaracterialSurveyResponse {
  id: string;
  studentId: string;
  isCompleted: boolean;
}

interface SelectOption {
  label: string;
  value: string;
}

interface SocialStatusResponse {
  id: string;
  studentId: string;
  courseId: string;
  responses: any;
  isCompleted: boolean;
  // Otros campos que el backend devuelva (responses, etc.)
}

const API_BASE_URL = "http://4.228.227.51:3000/api";

const SocialView: React.FC = () => {
  const [userData, setUserData] = useState<JwtPayload | null>(null);
  const [studentId, setStudentId] = useState<string>("");
  const [curseId, setCurseId] = useState<string>("");
  const [course, setCourse] = useState<Course | null>(null);
  const [globalStudents, setGlobalStudents] = useState<Student[]>([]);
  const [socialStatus, setSocialStatus] = useState<SocialSurveyResponse[]>([]);
  const [caracterialStatus, setCaracterialStatus] = useState<
    CaracterialSurveyResponse[]
  >([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<{
    q1: SelectOption[] | null;
    q2: SelectOption[] | null;
    q3: SelectOption[] | null;
    q4: SelectOption[] | null;
  }>({ q1: null, q2: null, q3: null, q4: null });
  const [message, setMessage] = useState<string>("");

  // Cargar userData desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  }, []);

  // Cargar el curso actual (se asume que courseId está almacenado en localStorage)
  useEffect(() => {
    const courseId = localStorage.getItem("courseId");
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const response = await axios.get<Course[]>(`${API_BASE_URL}/courses/`);
        const course = response.data.find((c) => c.id === courseId);
        if (course) {
          console.log("Curso encontrado:", course);
          setCourse(course);
        } else {
          console.log("No se encontró el curso con id:", courseId);
        }
      } catch (error) {
        console.error("Error al cargar curso:", error);
      }
    };

    fetchCourse();
  }, []);

  // 3. Cargar la lista global de estudiantes
  useEffect(() => {
    const fetchGlobalStudents = async () => {
      try {
        const response = await axios.get<Student[]>(
          `${API_BASE_URL}/users/students`
        );
        setGlobalStudents(response.data);
      } catch (error: any) {
        console.error(
          "Error al obtener la lista global de estudiantes:",
          error.response?.data || error.message
        );
      }
    };
    fetchGlobalStudents();
  }, []);

  // // Para estudiantes: cargar el progreso guardado en localStorage
  // useEffect(() => {
  //   const storedResponses = localStorage.getItem("socialSurveyResponses");
  //   if (storedResponses) {
  //     try {
  //       setFormValues(JSON.parse(storedResponses));
  //     } catch (err) {
  //       console.error("Error al parsear respuestas guardadas", err);
  //     }
  //   }
  // }, []);

  // // Para profesores: cargar el estado de las encuestas sociales de los estudiantes
  // useEffect(() => {
  //   // Solo se ejecuta si el usuario es profesor y el curso está definido
  //   if (!userData || !course || userData.role.toLowerCase() !== "profesor")
  //     return;
  //   const fetchSocialStatus = async () => {
  //     try {
  //       // Se asume un endpoint que retorna el estado de las encuestas de los estudiantes del curso
  //       const response = await axios.get<SocialSurveyResponse[]>(
  //         `${API_BASE_URL}/surveys/social-status?courseId=${course.id}`
  //       );
  //       setSocialStatus(response.data);
  //     } catch (error: any) {
  //       console.error(
  //         "Error al obtener estado de encuestas:",
  //         error.response?.data || error.message
  //       );
  //     }
  //   };
  //   fetchSocialStatus();
  // }, [userData, course]);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const parsed: JwtPayload = JSON.parse(storedData);
      setStudentId(parsed.sub);
    }
    const courseData = localStorage.getItem("courseId");

    if (!studentId || !courseData) return;

    const fetchSocialCompletedStatus = async () => {
      try {
        // GET /api/surveys/social/
        const response = await axios.get<SocialStatusResponse[]>(
          `http://4.228.227.51:3000/api/surveys/all-social`
        );
        console.log("Respuestas de la encuesta:", response.data);
        // Si isCompleted = true, mostramos un mensaje previo
        // obtener la respuesta cuyo StudentId sea el del usuario logeado
        const userResponse = response.data.find(
          (res) => res.studentId === studentId && res.courseId === courseData
        );
        console.log("Respuestas del usuario:", userResponse);
        if (userResponse) {
          setIsCompleted(userResponse.isCompleted);
          if (userResponse.isCompleted) {
            setMessage(
              "Ya has completado esta encuesta. Puedes actualizar tus respuestas si lo deseas al apretar el botón."
            );
            // Si quieres también precargar las respuestas, aquí podrías setFormValues con lo que devuelva el backend.
            //setFormValues(userResponse.responses);
          }
        }
      } catch (error: any) {
        console.error(
          "Error al verificar estado de la encuesta:",
          error.response?.data || error.message
        );
      }
    };
    fetchSocialCompletedStatus();
  }, [studentId]);

  //GET SOCIAL AND CARACTERIAL SURVEY STATUS
  // Para profesores: cargar estados de encuestas sociales y caracteriales
  useEffect(() => {
    const courseId = localStorage.getItem("courseId");
    if (!courseId) return;
    const fetchStatuses = async () => {
      try {
        // Llamada al endpoint para estado de encuesta social
        const socialRes = await axios.get<SocialSurveyResponse[]>(
          `${API_BASE_URL}/surveys/all-social`
        );
        const allSocial = socialRes.data.filter((c) => c.courseId === courseId);
        setSocialStatus(allSocial);
        console.log("Estado de encuesta social:", allSocial);
      } catch (error: any) {
        console.error(
          "Error al obtener estado de encuesta social:",
          error.response?.data || error.message
        );
      }
      try {
        // Llamada al endpoint para estado de encuesta caracterial
        const caracRes = await axios.get<CaracterialSurveyResponse[]>(
          `${API_BASE_URL}/surveys/all-caracterial`
        );

        const allStudentCarac = caracRes.data.filter((c) =>
          course?.studentIds.includes(c.studentId)
        );
        setCaracterialStatus(allStudentCarac);
        console.log("Estado de encuesta caracterial:", allStudentCarac);
      } catch (error: any) {
        console.error(
          "Error al obtener estado de encuesta caracterial:",
          error.response?.data || error.message
        );
      }
    };
    fetchStatuses();
  }, [userData, course]);

  // Función para guardar cada cambio en el formulario y guardarlo en localStorage
  const handleFieldChange = (
    field: "q1" | "q2" | "q3" | "q4",
    value: SelectOption[] | null
  ) => {
    const newValues = { ...formValues, [field]: value };
    setFormValues(newValues);
    // localStorage.setItem("socialSurveyResponses", JSON.stringify(newValues));
  };

  // Enviar respuestas de la encuesta social (para estudiantes)
  const onSubmit = async () => {
    if (!userData) return;
    const confirmSend = window.confirm("¿Está seguro de enviar la encuesta?");
    if (!confirmSend) return;
    // Construir un objeto donde cada clave tenga un array de studentIds
    const responses: { [key: string]: string[] } = {};
    (["q1", "q2", "q3", "q4"] as const).forEach((q) => {
      responses[q] = formValues[q]?.map((opt) => opt.value) || [];
    });
    try {
      await axios.post(
        `${API_BASE_URL}/surveys/social`,
        { studentId: userData.sub, courseId: course?.id, responses: responses },
        { withCredentials: true }
      );
      setMessage("Encuesta social enviada exitosamente.");
      // Opcional: limpiar el progreso almacenado
      localStorage.removeItem("socialSurveyResponses");
    } catch (error: any) {
      console.error(
        "Error al enviar la encuesta social:",
        error.response?.data || error.message
      );
      setMessage("Error al enviar la encuesta social.");
    }
  };

  // Función para obtener los datos completos de un estudiante a partir de su ID
  const getStudentDetails = (studentId: string): Student | undefined => {
    return globalStudents.find((s) => s.id === studentId);
  };

  // Opciones para el select de estudiantes (excluyendo el usuario actual)
  const studentOptions: SelectOption[] = course?.studentIds
    ? course.studentIds
        .filter((s) => s !== userData?.sub)
        .map((s) => {
          const student = getStudentDetails(s);
          return {
            label: `${student?.name || s} (${student?.email || s})`,
            value: student?.id || s,
          };
        })
    : [];

  // Dentro de SocialView.tsx
  const handleSendReminderEmails = async () => {
    if (!course) return;
    const confirmSend = window.confirm("¿Está seguro de enviar los correos?");
    if (!confirmSend) return;
    // Filtrar los estudiantes inscritos en el curso
    const courseStudents = globalStudents.filter((s) =>
      course.studentIds.includes(s.id)
    );

    // Filtrar solo aquellos estudiantes que no hayan completado alguna encuesta
    const pendingStudents = courseStudents.filter((student) => {
      const social = socialStatus.find((s) => s.studentId === student.id);
      const carac = caracterialStatus.find((s) => s.studentId === student.id);
      const socialIncomplete = !social || !social.isCompleted;
      const caracIncomplete = !carac || !carac.isCompleted;
      return socialIncomplete || caracIncomplete;
    });

    // Extraer los correos de los estudiantes que tienen encuestas pendientes o sin datos
    const emails = pendingStudents
      .map((s) => s.email)
      .filter((email): email is string => Boolean(email));

    if (emails.length === 0) {
      setMessage("Todos los estudiantes han completado las encuestas.");
      return;
    }
    try {
      console.log("Enviando recordatorios a:", emails);
      // Se asume que existe un endpoint para enviar recordatorios por email.
      const response = await axios.post(
        `${API_BASE_URL}/users/send-reminder-emails`,
        {
          courseName: course.name,
          emails,
        }
      );
      console.log("Recordatorios enviados:", response.data);
      setMessage(
        "Recordatorios enviados exitosamente a los estudiantes pendientes."
      );
    } catch (error: any) {
      console.error(
        "Error al enviar recordatorios:",
        error.response?.data || error.message
      );
      setMessage("Error al enviar los recordatorios.");
    }
  };

  // Render para estudiantes: formulario de encuesta social
  const renderStudentForm = () => (
    <div>
      <Heading size="xlarge">Encuesta Social Curso: {course?.name}</Heading>
      {isCompleted && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            marginTop: "20px",
          }}
        >
          <Box backgroundColor="color.background.success" padding="space.200">
            <Heading size="small">
              Ya has completado esta encuesta. Puedes actualizar tus respuestas
              si lo deseas al apretar el botón.
            </Heading>
          </Box>
        </div>
      )}
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <Heading size="small">
          Por favor, responda las siguientes 4 preguntas seleccionando los
          estudiantes de este curso (no se mostrará su propio nombre), puede
          dejar las preguntas en blanco si no desea responderlas o le es
          indiferente.
        </Heading>
      </div>
      {/* Cada pregunta utiliza un Select multi */}
      {(["q1", "q2", "q3", "q4"] as const).map((q, idx) => (
        <div key={q} style={{ marginBottom: "20px" }}>
          <Heading size="small">
            {idx + 1}.{" "}
            {q === "q1"
              ? "¿A quién(es) elegirías para trabajar en equipo?"
              : q === "q2"
              ? "¿Quién(es) crees que te elegirían para trabajar en equipo?"
              : q === "q3"
              ? "¿A quién(es) NO elegirías para trabajar en equipo?"
              : "¿Quién(es) crees que NO te elegirían para trabajar en equipo?"}
          </Heading>
          <Select<SelectOption>
            options={studentOptions}
            placeholder="Seleccione..."
            isClearable
            isMulti
            onChange={(newValue) =>
              handleFieldChange(q, newValue as SelectOption[] | null)
            }
            // Si se guardó progreso, mostrar el valor guardado
            value={formValues[q] || undefined}
          />
        </div>
      ))}
      <Button appearance="primary" onClick={onSubmit}>
        Enviar Encuesta Social
      </Button>
      <br />
      <br />
      <br />
      <br />
    </div>
  );

  // Filtrar la lista de estudiantes inscritos en el curso (con datos completos)
  const courseStudents: Student[] = course
    ? globalStudents.filter((s) => course.studentIds.includes(s.id))
    : [];

  // Render para profesores: mostrar el estado de ambas encuestas para cada estudiante
  const renderProfessorView = () => (
    <div>
      <Heading size="xlarge">Estado de Encuestas Curso: {course?.name}</Heading>
      {courseStudents.length === 0 ? (
        <Heading size="small">
          No hay estudiantes inscritos en este curso.
        </Heading>
      ) : (
        <dl>
          {courseStudents.map((student) => {
            const social = socialStatus.find((s) => s.studentId === student.id);
            const carac = caracterialStatus.find(
              (s) => s.studentId === student.id
            );
            return (
              <li key={student.id} style={{ marginBottom: "12px" }}>
                <strong>{student.name}</strong> ({student.email})<br />
                Encuesta Social:{" "}
                <span
                  style={{
                    color: social
                      ? social.isCompleted
                        ? "green"
                        : "orange"
                      : "red",
                  }}
                >
                  {social
                    ? social.isCompleted
                      ? "Completada"
                      : "Pendiente"
                    : "Sin datos"}
                </span>
                <br />
                Encuesta Caracterial:{" "}
                <span
                  style={{
                    color: carac
                      ? carac.isCompleted
                        ? "green"
                        : "orange"
                      : "red",
                  }}
                >
                  {carac
                    ? carac.isCompleted
                      ? "Completada"
                      : "Pendiente"
                    : "Sin datos"}
                </span>
              </li>
            );
          })}
        </dl>
      )}
      {/* Botón para enviar recordatorio por email */}
      <div style={{ marginTop: "20px" }}>
      <Heading size="small">
        Usted puede a continuación enviar un correo a cada estudiante que no ha
        completado su encuesta
      </Heading>
      </div>
      <Button
        appearance="primary"
        onClick={handleSendReminderEmails}
        style={{ marginTop: "20px" }}
      >
        Enviar recordatorio por email
      </Button>
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {userData?.role.toLowerCase() === "profesor"
        ? renderProfessorView()
        : renderStudentForm()}
      {message && (
        <div style={{ marginTop: "20px", marginBottom: "50px" }}>
          <Box backgroundColor="color.background.success" padding="space.100">
            <Heading size="small">{message}</Heading>
          </Box>
        </div>
      )}
      <br />
      <br />
      <br />
      <br />
      
    </div>
  );
};

export default SocialView;
