import needle from "needle";
import dotenv from "dotenv";
import { Rule, TweetFormatted, TweetStream } from "./types/twitter";
import { dynamodb_updateTweet } from "./aws";
import { sqs_send_msg } from "./aws_sqs";

dotenv.config();

const BEARER_TOKEN: string = process.env.TWITTER_API_BEARER_TOKEN ?? "";
const tablename = process.env.AWS_TABLE_NAME ?? "";
const sqs_name = process.env.SQS_QUEUE_NAME ?? "";
const sqs_url = process.env.SQS_QUEUE_URL ?? "";

const RULES_URL = "https://api.twitter.com/2/tweets/search/stream/rules";
const STREAM_URL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,edit_controls,edit_history_tweet_ids,entities,geo,id,in_reply_to_user_id,lang,non_public_metrics,organic_metrics,possibly_sensitive,promoted_metrics,public_metrics,referenced_tweets,reply_settings,source,text,withheld&expansions=attachments.media_keys,attachments.poll_ids,author_id,edit_history_tweet_ids,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id&media.fields=alt_text,duration_ms,height,media_key,non_public_metrics,organic_metrics,preview_image_url,promoted_metrics,public_metrics,type,url,variants,width&poll.fields=duration_minutes,end_datetime,id,options,voting_status&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type";

// set rule for twitter string
export const setRules = async (rules: Rule[]) => {
  try {
    const data = {
      "add": rules,
    };
    const res = await needle("post", RULES_URL, data, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${BEARER_TOKEN}`,
      },
    });
    if (res.statusCode !== 201) {
      console.error(
        `Error setting rule: ${res.statusCode} ${res.statusMessage} `,
        res.body,
      );
      // console.log(res);
    } else {
      console.log("setRule success", res.body);
      return res.body;
    }
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
      console.log("error");
    }
    // throw new Error("dynamodb_deleteTable error unknown type");
    console.log("error");
  }
};
// export const getAllRules = async () => {
//   try {
//     const res = await needle("get", RULES_URL, {
//       headers: {
//         authorization: `Bearer ${BEARER_TOKEN}`,
//       },
//     });
//     if (res.statusCode !== 200) {
//       console.error(`Error get rule: ${res.statusCode} ${res.statusMessage} `);
//     } else {
//       console.log("get success", res.body);
//       return res.body;
//     }
//   } catch (e) {
//     if (e instanceof Error) {
//       throw e;
//     }
//     throw new Error("dynamodb_deleteTable error unknown type");
//   }
// };
//
// export const deleteAllRules = async (rules: any) => {
//   try {
//     if (!Array.isArray(rules.data)) {
//       throw new Error("invalid rule set in delall rules");
//     }
//     const res = await needle(
//       "post",
//       RULES_URL,
//       {
//         add: rules,
//       },
//       {
//         headers: {
//           "content-type": "application/json",
//           authorization: `Bearer ${BEARER_TOKEN}`,
//         },
//       },
//     );
//     if (res.statusCode !== 200) {
//       console.error(
//         `Error deleting rule: ${res.statusCode} ${res.statusMessage} `,
//       );
//     } else {
//       console.log("delrules success", res.body);
//       return res.body;
//     }
//   } catch (e) {
//     if (e instanceof Error) {
//       throw e;
//     }
//     throw new Error("deleteAllRules error unknown type");
//   }
// };
// // const parseTweet = (stream: TweetStream): TweetFormatted | Error => {
// //   try {
// //     const user = stream.includes.users[0];
// //     const tweet = stream.includes.tweets[0];
// //     const place = stream.includes.places[0];
// //
// //     return {
// //       id: tweet.id,
// //       userId: user.id,
// //       userName: user.name,
// //       text: tweet.text,
// //       date: tweet.created_at,
// //       geo: {
// //         id: place.id,
// //         name: place.name,
// //         country: place.country,
// //         fullName: place.full_name,
// //         placeType: place.place_type,
// //         country_code: place.country_code,
// //         coordinates: {
// //           lat: place.geo.bbox[0],
// //           long: place.geo.bbox[1],
// //         },
// //       },
// //     };
// //   } catch (e) {
// //     if (e instanceof Error) {
// //       return e;
// //     }
// //     throw new Error("parseTweet unexpected errror ");
// //   }
// // };
//
// // export const connectStream = async (retryAttempt: number = 0) => {
// //   try {
// //     const stream = await needle("get", STREAM_URL, {
// //       headers: {
// //         authorization: `Bearer ${BEARER_TOKEN}`,
// //       },
// //       timeout: 20000,
// //     });
// //     stream
// //       .on("data", async (data) => {
// //         try {
// //           const json: TweetStream = JSON.parse(data);
// //           const parsetweet = parseTweet(json);
// //
// //           if (parsetweet instanceof Error) {
// //             console.log("error parse tweet", parsetweet.message);
// //           } else {
// //             const updatetweet = await dynamodb_updateTweet(
// //               tablename,
// //               parsetweet,
// //               parsetweet.id,
// //             );
// //
// //             if (updatetweet instanceof Error) {
// //               console.log(
// //                 "Error updatetweet of connectStream",
// //                 updatetweet.message,
// //               );
// //             }
// //
// //             const sqs_res = sqs_send_msg(sqs_url, JSON.stringify(parsetweet));
// //             if (sqs_res instanceof Error) {
// //               console.log(
// //                 "Error sqs_send_msg of connectStream ",
// //                 sqs_res.message,
// //               );
// //             }
// //           }
// //           retryAttempt = 0;
// //         } catch (e) {
// //           if (data.statusCode === 401) {
// //             console.log("Error status 401", data);
// //             // throw new Error("Error status 401");
// //           } else if (
// //             data.detail ===
// //             "This stream is currently at the maximun allowed connection limit."
// //           ) {
// //             console.log("Error stream max limit", data.detail);
// //             // throw new Error("Error Stream max limit");
// //           } else {
// //             //do nothing keep alive
// //           }
// //         }
// //       })
// //       .on("error", (e) => {
// //         console.error("Error on..", e.message);
// //         if ((e as any).code !== "ECONNRESET") {
// //           console.log("invalid Error Code", (e as any).code);
// //         } else {
// //           console.log(
// //             "Twitter connection fail try again, Attempt:",
// //             retryAttempt,
// //           );
// //           setTimeout(() => {
// //             connectStream(++retryAttempt);
// //           }, 2 ** retryAttempt);
// //         }
// //       });
// //   } catch (e) {
// //     console.error("Error connecting to stream:");
// //   }
// // };
