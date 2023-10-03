import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  gql,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";

const SERVER_URL_QUERY = 'localhost:5890/query';

// type User = {
//   id: string
//   name: string
// }

// type NewOffer = {
//   biddingId: string
//   memberId: string
//   memberName: string
//   value: number
// }

// type OfferResponse = {
//   testBiddingOffers: {
//     id: string
//     biddingId: string
//     memberId: string
//     memberName: string
//     value: number
//     submittedAt: string
//   }[]
// }

type OfferResponse2 = {
  bidding_offers: {
    display_name: string
    avatar: string
    price_offered: number
    created_at: string
  }[]
}

// type WinnerResponse = {
//   testBiddingWinner: {
//     id: string
//     name: string
//     profilePic?: string
//   }
// }

type WinnerResponse2 = {
  bidding_winner: {
    display_name: string
    avatar: string
    price_offered: number
    created_at: string
  }
}

const link = new WebSocketLink({
  uri: `ws://${SERVER_URL_QUERY}`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: `http://${SERVER_URL_QUERY}`,
  cache: new InMemoryCache(),
});

// const GET_OFFERS = gql`
//   subscription ($biddingId: String!) {
//     testBiddingOffers(biddingId: $biddingId) {
//       biddingId
//       memberName
//       value
//       submittedAt
//     }
//   }
// `;

const GET_OFFERS_2 = gql`
  subscription ($bidding_product_id: String!) {
    bidding_offers(bidding_product_id: $bidding_product_id) {
      display_name
      avatar
      price_offered
      created_at
    }
  }
`;

// const GET_WINNER = gql`
//   subscription ($biddingId: String!) {
//     testBiddingWinner(biddingId: $biddingId) {
//       id
//       name
//     }
//   }
// `;

const GET_WINNER_2 = gql`
  subscription ($bidding_product_id: String!) {
    bidding_winner(bidding_product_id: $bidding_product_id) {
      display_name
      avatar
      price_offered
      created_at
    }
  }
`;

// const SEND_BID = gql`
//     mutation ($input: TestNewOffer!) {
//       testBid(input: $input) {
//         id
//         value
//       }
//     }
// `;

// const Bid = ({biddingId}: {biddingId: string}) => {
//   const [bid, setBid] = useState<NewOffer>({
//     biddingId,
//     memberId: users[0].id,
//     memberName: users[0].name,
//     value: 0,
//   })
//   const [sendBid] = useMutation(SEND_BID);

//   return (
//     <>
//       <form action="#" onSubmit={(e) => {
//         e.preventDefault();

//         sendBid({
//           variables: { input: bid }
//         }).catch((err) => console.error(err));
//       }}>
//         <label htmlFor="user">User</label>
//         <select id="user" name="user" onChange={(e) => setBid({
//           ...bid,
//           memberId: e.target.value.split(':::')[0],
//           memberName: e.target.value.split(':::')[1]
//         })}>
//           {users.map(({ id, name }, idx) => <option key={`usr-${idx}`} value={`${id}:::${name}`}>{name}</option>)}
//         </select>
//         <br />
//         <br />

//         <label htmlFor="bid-value">Value</label>
//         <input id="bid-value" name="bid-value" type="number" onChange={(e) => setBid({
//           ...bid,
//           value: Number(e.target.value)
//         })} />

//         <button type="submit">Send</button>
//       </form>
//     </>
//   )
// }

const Offers = ({biddingId}: {biddingId: string}) => {
  const { data, error: offerError } = useSubscription<OfferResponse2>(GET_OFFERS_2, {
    variables: {
      bidding_product_id: biddingId,
    }
  });
  if (offerError) {
    console.error('errorOffer', offerError)
  }
  console.log("offers cc", data)

  const { data: winner, error } = useSubscription<WinnerResponse2>(GET_WINNER_2, {
    variables: {
      bidding_product_id: biddingId,
    }
  });
  if (error) {
    console.error('errorWinner', error)
  }
  console.log("winner cc", winner)

  if (!data || !winner) {
    return <></>;
  }


  return (
    <>
      <ul>
        {data.bidding_offers.map((dt, idx) => {
          console.log('dt', dt);
          console.log('winner', winner)
          return <li key={`bid-${idx}`}>{dt.display_name}: {dt.price_offered} @{dt.created_at}</li>
        })}
      </ul>
      <div>Winner: {winner?.bidding_winner?.display_name}</div>
    </>
  )
}

const App = () => {
  const biddingId = new URLSearchParams(window.location.search)?.get('biddingId');

  if (biddingId === null) {
    return <>Unknown Bidding</>
  }

  return (
    <ApolloProvider client={client}>
      <h3>Bidding</h3>
      <Offers biddingId={biddingId} />
      <br />
      {/* <Bid biddingId={biddingId} /> */}
    </ApolloProvider>
  )
}

export default App
