export const convertNotationToObject = (notation: string, nestedValue):any => {
    let object = {}
    let pointer = object;
    notation.split('.').map( (key, index, arr) => {
      pointer = (pointer[key] = (index == arr.length - 1? nestedValue: {}))
    });
    return object;
}


export const getAge = (birthDate: Date) => {
  const timeDiff = Math.abs(Date.now() - birthDate.getTime());
  return Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
};


export const getEventCardDefaultImage = (type: "CHARITY" | "VOLUNTEER" | "DONATION" | "ASSISTANCE") => {
  if(type === "CHARITY") {
    return "../../../assets/img/event-thumbnail.png";
  } else if(type === "VOLUNTEER") {
    return "../../../assets/img/event-thumbnail-3.png";
  } else if(type === "DONATION") {
    return "../../../assets/img/event-donation-thumbnail.png";
  } else if(type === "ASSISTANCE") {
    return "../../../assets/img/event-help-thumbnail.png";
  } else {
    return "../../../assets/img/event-thumbnail.png";
  }
}