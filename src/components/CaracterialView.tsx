// CaracterialSurvey.tsx
import React, { useState, useEffect } from "react";

import axios from "axios";
import Form, {
  Field,
  FormHeader,
  FormSection,
  FormFooter,
} from "@atlaskit/form";
import Button from "@atlaskit/button/standard-button";
import { RadioGroup } from "@atlaskit/radio";
import Heading from "@atlaskit/heading";
import { Box } from "@atlaskit/primitives";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  run: string;
  eneatype: string;
}

interface CaracterialStatusResponse {
  id: string;
  studentId: string;
  responses: any;
  isCompleted: boolean;
  // Otros campos que el backend devuelva (responses, etc.)
}

// Opciones de respuesta para la encuesta
const options = [
  { label: "Muy en desacuerdo", value: "1" },
  { label: "En desacuerdo", value: "2" },
  { label: "Neutral", value: "3" },
  { label: "De a cuerdo", value: "4" },
  { label: "Muy de a cuerdo", value: "5" },
];

// Array de preguntas
const questions: string[] = [
  "Creo que he pagado un elevado precio por tratar de ser perfecto.",
  "Mis principios e ideales me estimulan hacia mayores logros y dan sentido y valor a mi vida.",
  "Depende tanto de mí que se hagan las cosas que tengo que ser más organizado y metódico que los demás.",
  "Me imagino que tengo una misión personal, tal vez una vocación para algo superior, y creo que durante mi vida podría realizar algo extraordinario.",
  "Detesto los errores, por lo tanto tiendo a ser muy minucioso para asegurarme de que las cosas se hagan bien.",
  "Mi auténtico interés por los demás hace que me involucre profundamente con ellos, con sus esperanzas, sus sueños y necesidades.",
  "No puedo ver un perro extraviado en la calle sin desear llevármelo a casa.",
  "Es cierto que suelo hacer más por los demás de lo que debiera; doy demasiado y no pienso en mí lo suficiente.",
  "Hago un esfuerzo especial por saber qué les pasa a las personas que quiero.",
  "Con frecuencia mi salud y mi economía han sufrido debido a que antepongo las necesidades e intereses de los demás a los míos.",
  "Me considero una persona muy competente: en realidad, me molesta no ser eficaz y eficiente.",
  "Es importante para mí sentir que tengo éxito, aunque aún no sea el éxito que deseo.",
  "Para bien o para mal, soy bueno para encubrir mis inseguridades; nadie adivina jamás qué siento realmente.",
  "Sé lo bien que les va a mis amigos y colegas, y tiendo a compararme con ellos.",
  "Tengo una adicción al trabajo; me siento perdido si no estoy realizando cosas.",
  "Muchos me consideran una persona enigmática, difícil y contradictoria, ¡y eso me gusta de mí!, soy bastante dramática y temperamental.",
  "Tiendo a no seguir las reglas ni las expectativas porque quiero poner mi sello especial en todo lo que hago. Me cuesta participar en proyectos si no tengo el control creativo.",
  "Tiendo a pasar bastante tiempo imaginando situaciones y conversaciones que no han ocurrido necesariamente.",
  "Conocerme a mí mismo y ser fiel a mis necesidades emocionales han sido motivaciones muy importantes para mí.",
  "Soy muy consciente de mis intuiciones, tenga o no el valor para seguirlas.",
  "Me gusta profundizar en las cosas, y estudio detenidamente los detalles hasta que lo he entendido todo lo mejor posible.",
  "Soy una persona muy reservada, no dejo entrar a muchas personas en mi mundo.",
  "Solo teniendo la información correcta se puede tomar una decisión racional, pero, claro, la mayoría de la gente no es muy racional.",
  "Mi familia me encuentra algo raro o excéntrico; ciertamente me han dicho que debo salir más.",
  "Soy muy curioso y me gusta investigar por qué las cosas son como son; incluso las cosas obvias no son tan obvias si se miran bien.",
  "Soy muy emotivo, pero no suelo demostrar mis sentimientos, a no ser a mis íntimos, e incluso a ellos, no siempre.",
  "Me siento más seguro haciendo lo que se espera de mí que obrando por mi cuenta.",
  "Sé cuánto enredo armo yo, de modo que encuentro lógico desconfiar de lo que pretenden los demás.",
  "Deseo fiarme de las personas, pero suelo sorprenderme desconfiando de sus motivos.",
  "Cuando tengo que tomar una decisión importante, consulto la opinión de las personas en que confío.",
  "Me encanta viajar y descubrir diferentes tipos de comidas, personas y experiencias, ¡todo el fabuloso torbellino de la vida!",
  "Una cosa que no soporto de ninguna manera es el aburrimiento, y procuro no aburrirme nunca, aunque me distraiga con facilidad y me disperse demasiado.",
  "Me comprometo bastante cuando estoy en una relación, pero cuando se acaba, paso a otra cosa. De hecho, cuando ya no disfruto en una actividad dejo de hacerla.",
  "Soy curioso y arriesgado; por lo general, soy el primero entre mis amigos en probar cualquier cosa nueva e interesante.",
  "Tiendo a gastar más dinero del que probablemente debería y me encanta estar con gente, siempre que quieran ir donde yo voy.",
  "Soy extraordinariamente independiente y no me gusta depender de nadie para lo que necesito.",
  "Cuando quiero a las personas las considero «mi gente» y siento la necesidad de cuidar de sus intereses, pero no siento mucha compasión por los débiles y los indecisos: la debilidad solo atrae problemas.",
  "Tengo una voluntad fuerte y no renuncio ni me echo atrás fácilmente. Incluso, soy capaz de violentos estallidos de cólera, pero se me pasan.",
  "Me considero un desafiador, una persona que saca a las personas de su zona de comodidad para que hagan todo lo que son capaces de hacer.",
  "Mi sentido del humor es prosaico, incluso grosero a veces, aunque creo que la mayoría de las personas son demasiado remilgadas y sensibles.",
  "Parece que lo que más gusta de mí a las personas es que se sienten seguras a mi lado.",
  "No me importa estar con gente ni me importa estar solo; cualquiera de las dos cosas me va bien, siempre que esté en paz conmigo mismo.",
  "He encontrado un cierto equilibrio en mi vida, y no veo ningún motivo para estropearlo. Estar «cómodo» en todo el sentido de la palabra me atrae muchísimo.",
  "Prefiero ceder antes que armar una escena. Acentúo lo positivo antes que insistir en lo negativo.",
  "Me es fácil comprender diferentes puntos de vista y tiendo más a estar de acuerdo que en desacuerdo con las personas.",
];

const CaracterialView: React.FC = () => {
  const [studentId, setStudentId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Al montar el componente, se extrae el studentId del usuario logueado
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const parsed: JwtPayload = JSON.parse(storedData);
      setStudentId(parsed.sub);
      setUserRole(parsed.role);
    }
    const storedResponses = localStorage.getItem("caracterialSurveyResponses");
    if (storedResponses) {
      try {
        setFormValues(JSON.parse(storedResponses));
      } catch (err) {
        console.error("Error al parsear respuestas guardadas", err);
      }
    }
  }, []);

  // 2. Verificar si el estudiante ya completó la encuesta
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const parsed: JwtPayload = JSON.parse(storedData);
      setStudentId(parsed.sub);
    }
    if (!studentId) return;

    const fetchCaracterialStatus = async () => {
      try {
        // GET /api/surveys/caracterial/:studentId
        const response = await axios.get<CaracterialStatusResponse[]>(
          `http://4.228.227.51:3000/api/surveys/all-caracterial`
        );
        console.log("Respuestas de la encuesta:", response.data);
        // Si isCompleted = true, mostramos un mensaje previo
        // obtener la respuesta cuyo StudentId sea el del usuario logeado
        const userResponse = response.data.find(
          (res) => res.studentId === studentId
        );
        console.log("Respuestas del usuario:", userResponse);
        if (userResponse) {
          setIsCompleted(userResponse.isCompleted);
          if (userResponse.isCompleted) {
            setMessage(
              "Ya has completado esta encuesta. Puedes actualizar tus respuestas si lo deseas al apretar el botón."
            );
            // Si quieres también precargar las respuestas, aquí podrías setFormValues con lo que devuelva el backend.
            setFormValues(userResponse.responses);
          }
        }
      } catch (error: any) {
        console.error(
          "Error al verificar estado de la encuesta:",
          error.response?.data || error.message
        );
      }
    };
    fetchCaracterialStatus();
  }, [studentId]);

  // Handler para guardar cada respuesta en localStorage
  const handleFieldChange = (fieldName: string, value: string) => {
    const newValues = { ...formValues, [fieldName]: value };
    setFormValues(newValues);
    localStorage.setItem(
      "caracterialSurveyResponses",
      JSON.stringify(newValues)
    );
  };

  const onSubmit = async (values: { [key: string]: string }) => {
    const confirmSend = window.confirm(
      "¿Está seguro de enviar la encuesta?"
    );
    if (!confirmSend) return;
    // Construir el array de respuestas a partir de los valores del formulario.
    // Se asume que cada campo se nombra "q1", "q2", ..., "q45".
    const responses: { question: string; answer: number }[] = [];
    for (let i = 1; i <= 45; i++) {
      const answer = values[`q${i}`];
      responses.push({
        question: `pregunta ${i}`,
        answer: Number(answer),
      });
    }
    console.log("Respuestas de la encuesta:", responses);

    try {
      await axios.post(
        "http://4.228.227.51:3000/api/surveys/caracterial",
        { studentId, responses },
        { withCredentials: true }
      );
      setMessage("Encuesta enviada exitosamente.");
      window.alert("Encuesta enviada exitosamente.");

      // Luego debo obtener los resultados de la encuesta
      try {
        const answers = responses.map((response) => response.answer);
        const result = await axios.post(
          "http://4.228.227.51:3000/api/surveys/calculate-eneatype",
          { answers },
          { withCredentials: true }
        );
        console.log("Resultados de la encuesta:", result.data);
        setMessage(
          "Encuesta respondida exitosamente, su Eneatipo es el Tipo " +
            result.data +
            " Puede verlo reflejado en su perfil"
        );
        // Limpiar almacenamiento local de respuestas
        localStorage.removeItem("caracterialSurveyResponses");

        //Actualizar el eneatipo en la base de datos
        try {
          await axios.put(
            `http://4.228.227.51:3000/api/users/${studentId}`,
            { eneatype: String(result.data) },
            { withCredentials: true }
          );
          console.log("Eneatipo actualizado en la base de datos.");

          // Actualizar el eneatipo en el localStorage
          const storedData = localStorage.getItem("userData");
          if (storedData) {
            const parsed: JwtPayload = JSON.parse(storedData);
            localStorage.setItem(
              "userData",
              JSON.stringify({ ...parsed, eneatype: result.data })
            );
          }
        } catch (error: any) {
          console.error(
            "Error al actualizar el eneatipo en la base de datos:",
            error.response?.data || error.message
          );
          console.log("Error al actualizar el eneatipo en la base de datos.");
          console.log("Eneatipo a colocar" + result.data);
          console.log("IdUser" + studentId);
          setMessage("Error al actualizar el eneatipo en la base de datos.");
        }
      } catch (error: any) {
        console.error(
          "Error al obtener los resultados de la encuesta:",
          error.response?.data || error.message
        );
        setMessage("Error al obtener los resultados de la encuesta.");
        window.alert("Error al obtener los resultados de la encuesta.");
      }
    } catch (error: any) {
      console.error(
        "Error al enviar la encuesta:",
        error.response?.data || error.message
      );
      setMessage("Error al enviar la encuesta.");
    }
  };

  return (
    <div>
      {userRole === "profesor" && (
        <Box
          backgroundColor="color.background.success"
          padding="space.200"
        >
          <Heading size="small">
            IMPORTANTE: Usted es un profesor, su encuesta no tiene efecto
            práctico puesto que es utilizada en la creación de grupos, pero
            puede realizarla para saber que resultado tiene el cual se verá
            reflejado en su perfil de usuario.
          </Heading>
        </Box>
      )}

      {isCompleted && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Box
            backgroundColor="color.background.success"
            padding="space.200"
          >
            <Heading size="small">
              Ya has completado esta encuesta. Puedes actualizar tus respuestas
              si lo deseas.
            </Heading>
          </Box>
        </div>
      )}

      <div style={{ maxWidth: "800px", marginBottom: "20px", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Heading size="xlarge">Encuesta Caracterial</Heading>
        </div>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <div style={{ textAlign: "justify", marginBottom: "20px" }}>
            <Heading size="small">
              El Test del Eneagrama es una herramienta que identifica nueve
              tipos de personalidad distintos (numerados del 1 al 9), cada uno
              con patrones de pensamiento, motivación y conducta
              característicos. Al responder un cuestionario enfocado en rasgos
              emocionales y de comportamiento, la persona obtiene un perfil que
              refleja su tipo predominante. Este conocimiento puede servir para
              comprender mejor las fortalezas, desafíos y motivaciones internas,
              fomentando el desarrollo personal y una interacción más empática
              con los demás. Por favor, responda las siguientes 45 preguntas
              seleccionando la opción que mejor refleje su opinión.
            </Heading>
          </div>
        </div>
        <Form onSubmit={onSubmit}>
          {({ formProps, submitting }) => (
            <form {...formProps}>
              <FormHeader title="Test del Eneagrama" />
              <FormSection>
                {questions.map((question, index) => (
                  <Field
                    key={`q${index + 1}`}
                    name={`q${index + 1}`}
                    label={`${index + 1}. ${question}`}
                    isRequired
                    // Establecer defaultValue para que la respuesta se muestre si ya existe
                    defaultValue={formValues[`q${index + 1}`] || ""}
                  >
                    {({ fieldProps }) => (
                      <RadioGroup
                        {...fieldProps}
                        options={options}
                        // Al cambiar la respuesta, se guarda en localStorage
                        onChange={(event) => {
                          fieldProps.onChange(event);
                          handleFieldChange(
                            fieldProps.name,
                            event.target.value
                          );
                        }}
                      />
                    )}
                  </Field>
                ))}
              </FormSection>
              <FormFooter>
                <Button appearance="primary" type="submit">
                  Enviar Encuesta
                </Button>
              </FormFooter>
            </form>
          )}
        </Form>
        <div style={ { textAlign: "left", marginTop: "20px" } }>
          <Heading size="medium">{message}</Heading>
        </div>
      </div>
    </div>
  );
};

export default CaracterialView;
