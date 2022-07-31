import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createCake, deleteCake, getCakes, patchCake } from '../api/cakes-api'
import Auth from '../auth/Auth'
import { Cake } from '../types/Cake'

interface CakesProps {
  auth: Auth
  history: History
}

interface CakesState {
  cakes: Cake[]
  newCakeName: string
  loadingCakes: boolean
}

export class Cakes extends React.PureComponent<CakesProps, CakesState> {
  state: CakesState = {
    cakes: [],
    newCakeName: '',
    loadingCakes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCakeName: event.target.value })
  }

  onEditButtonClick = (cakeId: string) => {
    this.props.history.push(`/cakes/${cakeId}/edit`)
  }

  onCakeCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newCake = await createCake(this.props.auth.getIdToken(), {
        name: this.state.newCakeName,
        dueDate
      })
      this.setState({
        cakes: [...this.state.cakes, newCake],
        newCakeName: ''
      })
    } catch {
      alert('Cake creation failed')
    }
  }

  onCakeDelete = async (cakeId: string) => {
    try {
      await deleteCake(this.props.auth.getIdToken(), cakeId)
      this.setState({
        cakes: this.state.cakes.filter(cake => cake.cakeId !== cakeId)
      })
    } catch {
      alert('Cake deletion failed')
    }
  }

  onCakeCheck = async (pos: number) => {
    try {
      const cake = this.state.cakes[pos]
      await patchCake(this.props.auth.getIdToken(), cake.cakeId, {
        name: cake.name,
        dueDate: cake.dueDate,
        done: !cake.done
      })
      this.setState({
        cakes: update(this.state.cakes, {
          [pos]: { done: { $set: !cake.done } }
        })
      })
    } catch {
      alert('Cake deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const cakes = await getCakes(this.props.auth.getIdToken())
      this.setState({
        cakes,
        loadingCakes: false
      })
    } catch (e) {
      alert(`Failed to fetch cakes: `)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">CAKES</Header>

        {this.renderCreateCakeInput()}

        {this.renderCakes()}
      </div>
    )
  }

  renderCreateCakeInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Cake',
              onClick: this.onCakeCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Input cake's name"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCakes() {
    if (this.state.loadingCakes) {
      return this.renderLoading()
    }

    return this.renderCakesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading CAKES
        </Loader>
      </Grid.Row>
    )
  }

  renderCakesList() {
    return (
      <Grid padded>
        {this.state.cakes.map((cake, pos) => {
          return (
            <Grid.Row key={cake.cakeId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onCakeCheck(pos)}
                  checked={cake.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {cake.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {cake.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(cake.cakeId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onCakeDelete(cake.cakeId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {cake.attachmentUrl && (
                <Image src={cake.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
