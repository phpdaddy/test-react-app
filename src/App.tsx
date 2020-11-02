import React, {MouseEvent} from 'react';
import './App.css';
import axios from 'axios';
import {Button, Container, Grid, TextField, withStyles} from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import {Alert} from "@material-ui/lab";

const styles = () => ({
  container: {
    marginTop: '200px',
  },
});

type Props = {
  classes: {
    container: string;
  };
}
type Map = {
  [key: string]: string
}
type Field = {
  id: string,
  fieldName: string
}
type State = {
  schema: Field[],
  alertOpen: boolean,

  values: Map,
  errors: { [key: string]: string },
  isFormValid: boolean
}

class App extends React.Component<Props, State> {
  state = {
    schema: [],
    alertOpen: false,

    values: {} as Map,
    errors: {} as Map,
    isFormValid: false
  }

  componentDidMount() {

    axios.get(`http://localhost:8090/schema`)
      .then(res => {
        console.log(res.data);
        this.setState({
          schema: res.data
        }, () => {
          this.validate()
        });
      })

  }


  private handleSubmit = async (event: any) => {
    event.preventDefault();
    await axios.post(`http://localhost:8090/submit`, this.state.values);

    this.setState({
      alertOpen: true
    })
  }

  private createTextFields() {
    return this.state.schema.map((field: Field) =>
      <Grid item xs={12} key={field.id}>
        <TextField fullWidth
                   label={field.fieldName} name={field.id}
                   onChange={(e) => this.handleChange(field.id, e)}
                   required
                   error={!!this.state.errors[field.id]}
                   helperText={this.state.errors[field.id]}
        />
      </Grid>
    )
  }

  private validate = () => {
    this.state.schema.forEach((field: Field) => {
      if (field.id === 'email') {
        var pattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        if (!pattern.test(this.state.values["email"])) {
          this.setState({
            ...this.state,
            isFormValid: false,
            errors: {
              ...this.state.errors,
              [field.id]: "Please enter valid email address."
            }
          })
        } else {
          const errors = this.state.errors;
          delete errors[field.id];

          this.setState({
            ...this.state,
            errors
          })
        }
      }
    });
  }

  private handleChange = (id: string, event: any): void | undefined => {
    let values: any = {...this.state.values};
    values[id] = event.target.value;
    this.setState({values},()=>{
      this.validate()
    });

  }

  private handleCloseAlert = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({
      alertOpen: false
    })
  };


  private alert() {
    return <Snackbar
      anchorOrigin={{vertical: "top", horizontal: "center"}}
      open={this.state.alertOpen}
      autoHideDuration={6000}
      onClose={this.handleCloseAlert}

    >
      <Alert onClose={this.handleCloseAlert} severity="success">
        Form has been submitted! Check server log!
      </Alert>
    </Snackbar>
  }

  render() {
    return (
      <Container maxWidth="sm" className={this.props.classes.container}>

        <form onSubmit={this.handleSubmit}>{this.alert()}

          <Grid container spacing={3}>
            {this.createTextFields()}


            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">Submit</Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    )
  }

}

export default withStyles(styles)(App);