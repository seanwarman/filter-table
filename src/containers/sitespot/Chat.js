import React, { Component } from "react";
import "../../App.css";
import { Layout } from "antd";
import Input from "antd/lib/input";
import Button from "antd/lib/button";


const { Content } = Layout;

const questions = [
    {
        question: "Hey, What is your name?",
    },
    {
        question: "What is your age bracket?",
        options: [
            "1-5",
            "6-10",
            "11-20",
        ],
    },
    {
        question: "Hey, What is your name?",
    },
    {
        question: "What is your age bracket?",
        options: [
            "1-5",
            "6-10",
            "11-20",
        ],
    },{
        question: "Hey, What is your name?",
    },
    {
        question: "What is your age bracket?",
        options: [
            "1-5",
            "6-10",
            "11-20",
        ],
    },{
        question: "Hey, What is your name?",
    },
    {
        question: "What is your age bracket?",
        options: [
            "1-5",
            "6-10",
            "11-20",
        ],
    }
];


export default class Chat extends Component {
    constructor(props) {
        super(props);

        this.state = {

            questions: questions,
            currentQuestion: 0,
            currentChat: [],
            chatText: "",
            windowHeight: window.innerHeight
        }
    }

    updateChatText = (e) => {

        this.setState({chatText: e.target.value});

    }

    async componentDidMount() {

        await this.setState({currentChat: this.state.currentChat.concat({
                chatText: questions[0].question,
                className: 'chatSystem'
        })});

        window.addEventListener('resize', this.handleResize);

    }

    handleResize = (e) => {
        this.setState({windowHeight: window.innerHeight})
    };

     handleKeyDown = async (e) => {
        if (e.key === 'Enter') {

            await this.updateAnswer();
            console.log(this.state.questions);
        }
    }

    updateAnswer = async () => {

        var qa = this.state.currentChat;
        qa[this.state.currentQuestion].answer = this.state.chatText;

        await this.setState({
            questions: qa,
            chatText: "",
            currentQuestion: (this.state.currentQuestion + 1),
            currentChat: this.state.currentChat.concat(
                {
                    chatText: this.state.chatText,
                    className: "chatUser",
                }),
        });

        if (questions.length !== this.state.currentQuestion) {

            setTimeout(function() {
                this.setState({currentChat: this.state.currentChat.concat({
                        chatText: questions[this.state.currentQuestion].question,
                        className: 'chatSystem'
                    })});
            }.bind(this), 1000)



        } else {

            await this.setState({currentChat: this.state.currentChat.concat({
                    chatText: "All done!",
                    className: 'chatSystem'
                })});
        }


    }

    uptimeCheck = () => {



    }


    render() {

        return (
            <Content style={{
                margin: '94px 16px 24px', padding: 24, minHeight: 280, maxHeight: this.state.windowHeight - 170, height: this.state.windowHeight - 170
            }}
            >

                <Button onClick={this.uptimeCheck}>Check now</Button>

                <div className={"chat"} style={{maxHeight: this.state.windowHeight - 170, height: this.state.windowHeight - 170}}>
                    {
                        this.state.currentChat.map((item, i) => {

                            return(
                                <div key={i} className={item.className}>
                                    {item.chatText}
                                </div>
                            )

                        })
                    }

                    {this.state.currentQuestion !== questions.length ?

                        <Input onChange={this.updateChatText} value={this.state.chatText} onKeyDown={this.handleKeyDown}/>

                        : null
                    }

                </div>




            </Content>


        );
    }
}

